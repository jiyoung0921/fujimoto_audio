'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import type { TabType } from '@/types';
import AudioRecorder from '@/components/AudioRecorder';
import FileUploader from '@/components/FileUploader';
import ProgressModal from '@/components/ProgressModal';
import { ProcessingStatus, ErrorDetail } from '@/types';
import { Microphone, CloudUpload, CheckCircle, User, ArrowRight } from '@/components/Icons';
import styles from './page.module.css';

interface HomeProps {
    onTabChange?: (tab: TabType) => void;
}

export default function Home({ onTabChange }: HomeProps = {}) {
    const { data: session, status } = useSession();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
        step: 'upload',
        progress: 0,
        message: '準備中...',
    });
    const [error, setError] = useState<ErrorDetail | undefined>();
    const [result, setResult] = useState<{
        transcription: string;
        docxUrl: string;
    } | null>(null);

    // Safe JSON parser - prevents ERR_UNKNOWN when server returns non-JSON (e.g. Vercel's "Request Entity Too Large")
    const safeParseJSON = async (response: Response): Promise<any> => {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            // Server returned non-JSON (e.g. nginx/Vercel error page)
            const snippet = text.substring(0, 120);
            throw {
                code: response.status === 413 ? 'ERR_FILE_TOO_LARGE' : 'ERR_SERVER',
                message: response.status === 413
                    ? 'ファイルが大きすぎます。チャンクアップロードを使用してください。'
                    : `サーバーエラー (HTTP ${response.status}): ${snippet}`,
            };
        }
    };

    // Chunked upload: splits file into 4MB chunks and uploads sequentially
    const uploadFileInChunks = async (
        file: File | Blob,
        filename: string,
        onProgress: (received: number, total: number) => void
    ): Promise<string> => {
        const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB per chunk (well below Vercel's 4.5MB limit)
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        console.log(`[ChunkUpload] Starting: ${filename}, size=${(file.size / 1024 / 1024).toFixed(1)}MB, chunks=${totalChunks}`);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk, filename);
            formData.append('chunkIndex', String(i));
            formData.append('totalChunks', String(totalChunks));
            formData.append('uploadId', uploadId);
            formData.append('filename', filename);

            let attempts = 0;
            const MAX_RETRIES = 3;
            while (attempts < MAX_RETRIES) {
                try {
                    const res = await fetch('/api/upload-chunk', { method: 'POST', body: formData });
                    const data = await safeParseJSON(res);

                    if (!data.success) {
                        throw { code: 'ERR_CHUNK', message: data.error || `チャンク ${i + 1}/${totalChunks} のアップロードに失敗` };
                    }

                    onProgress(i + 1, totalChunks);

                    if (data.complete) {
                        console.log(`[ChunkUpload] Complete: ${data.filePath}`);
                        return data.filePath;
                    }
                    break; // Success, move to next chunk
                } catch (err: any) {
                    attempts++;
                    if (attempts >= MAX_RETRIES) throw err;
                    console.warn(`[ChunkUpload] Chunk ${i + 1} failed (attempt ${attempts}), retrying...`, err);
                    await new Promise(r => setTimeout(r, 1000 * attempts));
                }
            }
        }
        throw { code: 'ERR_UPLOAD', message: 'チャンクアップロードが完了しませんでした' };
    };

    const handleFileProcess = async (file: File | Blob, filename: string) => {
        setIsProcessing(true);
        setResult(null);
        setError(undefined);

        try {
            setProcessingStatus({
                step: 'upload',
                progress: 5,
                message: 'ファイルをアップロード中... (0%)',
            });

            // Use chunked upload for all files to avoid Vercel size limits
            const filePath = await uploadFileInChunks(file, filename, (received, total) => {
                const pct = Math.round((received / total) * 25); // 0-25% for upload phase
                setProcessingStatus({
                    step: 'upload',
                    progress: 5 + pct,
                    message: `アップロード中... ${received}/${total} チャンク`,
                });
            });

            setProcessingStatus({
                step: 'transcribe',
                progress: 30,
                message: 'AIが文字起こし中... (大きなファイルは数分かかります)',
            });

            const selectedFolderId = localStorage.getItem('selectedDriveFolderId') || '';

            const transcribeResponse = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filePath,
                    originalName: filename,
                    fileType: file.type || 'audio/webm',
                    fileSize: file.size,
                    folderId: selectedFolderId,
                }),
            });

            const transcribeData = await safeParseJSON(transcribeResponse);

            if (!transcribeData.success) {
                throw {
                    code: 'ERR_TRANSCRIBE',
                    message: transcribeData.error || '文字起こしに失敗しました',
                };
            }

            setProcessingStatus({
                step: 'complete',
                progress: 100,
                message: '完了！',
            });

            setResult({
                transcription: transcribeData.transcription,
                docxUrl: transcribeData.docxUrl,
            });

            setTimeout(() => {
                setIsProcessing(false);
                if (onTabChange) {
                    onTabChange('history');
                }
            }, 2000);
        } catch (err: any) {
            console.error('Processing error:', err);

            setError({
                code: err.code || 'ERR_UNKNOWN',
                message: err.message || '不明なエラーが発生しました',
                timestamp: new Date().toISOString(),
            });
            setProcessingStatus({
                step: 'error',
                progress: 0,
                message: 'エラーが発生しました',
            });
        }
    };

    if (status === 'loading') {
        return (
            <div className={styles.loading}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className={styles.welcome}>
                <div className={styles.welcomeIcon}>
                    <Microphone size={64} weight="fill" />
                </div>
                <h1 className={styles.welcomeTitle}>VoiceDoc</h1>
                <p className={styles.welcomeText}>
                    音声をAIが自動で文字起こし
                </p>
                <div className={styles.welcomeFeatures}>
                    <div className={styles.feature}>
                        <Microphone size={24} />
                        <span>録音</span>
                    </div>
                    <div className={styles.feature}>
                        <CloudUpload size={24} />
                        <span>アップロード</span>
                    </div>
                    <div className={styles.feature}>
                        <CheckCircle size={24} weight="fill" />
                        <span>文字起こし</span>
                    </div>
                </div>
                <button
                    className={styles.welcomeHint}
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                >
                    <User size={20} />
                    <span>ログインして始めましょう</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    return (
        <>
            <ProgressModal
                isOpen={isProcessing}
                status={processingStatus}
                error={error}
                onClose={() => {
                    setIsProcessing(false);
                    setError(undefined);
                }}
            />

            <div className={styles.page}>
                {/* Recording Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Microphone size={20} />
                        <h2>録音</h2>
                    </div>
                    <div className={styles.card}>
                        <AudioRecorder
                            onRecordingComplete={(blob, filename) =>
                                handleFileProcess(blob, filename)
                            }
                        />
                    </div>
                </section>

                {/* Divider */}
                <div className={styles.divider}>
                    <span>または</span>
                </div>

                {/* Upload Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <CloudUpload size={20} />
                        <h2>ファイルアップロード</h2>
                    </div>
                    <FileUploader
                        onFileSelected={(file) => handleFileProcess(file, file.name)}
                    />
                </section>

                {/* Result */}
                {result && (
                    <section className={`${styles.section} ${styles.resultSection} fade-in`}>
                        <div className={styles.resultHeader}>
                            <CheckCircle size={28} weight="fill" className={styles.successIcon} />
                            <h2>完了しました！</h2>
                        </div>
                        <div className={styles.transcriptionBox}>
                            <p>{result.transcription}</p>
                        </div>
                        <a
                            href={result.docxUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-block"
                        >
                            Google Driveで開く
                        </a>
                    </section>
                )}
            </div>
        </>
    );
}
