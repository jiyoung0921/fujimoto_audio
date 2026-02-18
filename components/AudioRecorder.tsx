'use client';

import { useState, useRef, useEffect } from 'react';
import { generateFilename } from '@/lib/utils';
import { Microphone, StopCircle, PauseCircle, PlayCircle, Star, Monitor, MicMonitor } from './Icons';
import styles from './AudioRecorder.module.css';

type RecordingMode = 'mic' | 'screen' | 'both';

interface AudioRecorderProps {
    onRecordingComplete: (blob: Blob, filename: string) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [highlights, setHighlights] = useState<number[]>([]);
    const [highlightFlash, setHighlightFlash] = useState(false);
    const [recordingMode, setRecordingMode] = useState<RecordingMode>('mic');
    const [isMobile, setIsMobile] = useState(false);
    const [activeMode, setActiveMode] = useState<RecordingMode | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamsRef = useRef<MediaStream[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Detect mobile (getDisplayMedia not supported on mobile)
        const checkMobile = () => {
            const ua = navigator.userAgent;
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(ua));
        };
        checkMobile();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const cleanupStreams = () => {
        streamsRef.current.forEach(stream => {
            stream.getTracks().forEach(track => track.stop());
        });
        streamsRef.current = [];
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    const getMicStream = async (): Promise<MediaStream> => {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
    };

    const getScreenStream = async (): Promise<MediaStream> => {
        // Chrome requires video: true for getDisplayMedia, but we only use audio
        const stream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: true,
        });
        // Stop video tracks immediately - we only need audio
        stream.getVideoTracks().forEach(track => track.stop());
        // Create a new audio-only stream to avoid video data in the recording
        const audioOnlyStream = new MediaStream(stream.getAudioTracks());
        return audioOnlyStream;
    };

    const mixStreams = (streams: MediaStream[]): MediaStream => {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const destination = audioContext.createMediaStreamDestination();

        streams.forEach(stream => {
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(destination);
        });

        return destination.stream;
    };

    const startRecording = async () => {
        try {
            let recordStream: MediaStream;

            if (recordingMode === 'mic') {
                recordStream = await getMicStream();
                streamsRef.current = [recordStream];
            } else if (recordingMode === 'screen') {
                const screenStream = await getScreenStream();
                // Check if we actually got audio tracks
                if (screenStream.getAudioTracks().length === 0) {
                    alert('画面共有で「音声を共有」にチェックを入れてください。\n\nChromeの場合: 画面共有ダイアログで「タブの音声を共有」をオンにしてください。');
                    screenStream.getTracks().forEach(t => t.stop());
                    return;
                }
                // Use AudioContext to ensure clean audio-only stream
                recordStream = mixStreams([screenStream]);
                streamsRef.current = [screenStream];
            } else {
                // Both: mic + screen
                const micStream = await getMicStream();
                const screenStream = await getScreenStream();
                if (screenStream.getAudioTracks().length === 0) {
                    alert('画面共有で「音声を共有」にチェックを入れてください。');
                    screenStream.getTracks().forEach(t => t.stop());
                    micStream.getTracks().forEach(t => t.stop());
                    return;
                }
                streamsRef.current = [micStream, screenStream];
                recordStream = mixStreams([micStream, screenStream]);
            }

            // Use audio-specific MIME type to ensure no video data
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : undefined;
            const mediaRecorder = new MediaRecorder(recordStream, mimeType ? { mimeType } : undefined);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const filename = generateFilename();
                onRecordingComplete(blob, filename);
                cleanupStreams();
            };

            // Listen for screen share ending (user clicks "Stop sharing")
            if (recordingMode !== 'mic') {
                const screenStream = streamsRef.current[recordingMode === 'screen' ? 0 : 1];
                screenStream.getTracks().forEach(track => {
                    track.onended = () => {
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                            stopRecording();
                        }
                    };
                });
            }

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            setHighlights([]);
            setActiveMode(recordingMode);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Recording error:', error);
            cleanupStreams();
            if (recordingMode === 'mic') {
                alert('マイクへのアクセスに失敗しました');
            } else {
                alert('画面共有がキャンセルされました');
            }
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            setRecordingTime(0);
            setActiveMode(null);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const addHighlight = () => {
        setHighlights((prev) => [...prev, recordingTime]);
        setHighlightFlash(true);
        setTimeout(() => setHighlightFlash(false), 600);
    };

    // Not recording state - show mode selector + mic button
    if (!isRecording) {
        return (
            <div className={styles.recorder}>
                {/* Recording Mode Selector */}
                {!isMobile && (
                    <div className={styles.modeSelector}>
                        <button
                            className={`${styles.modeButton} ${recordingMode === 'mic' ? styles.modeActive : ''}`}
                            onClick={() => setRecordingMode('mic')}
                        >
                            <Microphone size={18} />
                            <span>マイク</span>
                        </button>
                        <button
                            className={`${styles.modeButton} ${recordingMode === 'screen' ? styles.modeActive : ''}`}
                            onClick={() => setRecordingMode('screen')}
                        >
                            <Monitor size={18} />
                            <span>画面音声</span>
                        </button>
                        <button
                            className={`${styles.modeButton} ${recordingMode === 'both' ? styles.modeActive : ''}`}
                            onClick={() => setRecordingMode('both')}
                        >
                            <MicMonitor size={18} />
                            <span>両方</span>
                        </button>
                    </div>
                )}

                <button className={styles.mainButton} onClick={startRecording}>
                    {recordingMode === 'mic' && <Microphone size={48} weight="fill" />}
                    {recordingMode === 'screen' && <Monitor size={48} />}
                    {recordingMode === 'both' && <MicMonitor size={48} />}
                </button>

                <p className={styles.hint}>
                    {recordingMode === 'mic' && 'タップして録音開始'}
                    {recordingMode === 'screen' && '画面音声を録音（Zoom等）'}
                    {recordingMode === 'both' && 'マイク + 画面音声を同時録音'}
                </p>

                {recordingMode !== 'mic' && (
                    <p className={styles.modeHint}>
                        💡 画面共有ダイアログで「タブの音声を共有」をオンにしてください
                    </p>
                )}
            </div>
        );
    }

    // Recording state - Apple Voice Memos style
    return (
        <div className={styles.recorder}>
            {/* Active mode indicator */}
            {activeMode && activeMode !== 'mic' && (
                <div className={styles.modeIndicator}>
                    {activeMode === 'screen' ? <Monitor size={14} /> : <MicMonitor size={14} />}
                    <span>{activeMode === 'screen' ? '画面音声を録音中' : 'マイク + 画面音声'}</span>
                </div>
            )}

            {/* Waveform visualization */}
            <div className={styles.waveformArea}>
                <div className={`${styles.waveform} ${isPaused ? styles.paused : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {/* Timer */}
            <div className={styles.timer}>
                {isPaused && <span className={styles.pausedLabel}>一時停止中</span>}
                <span className={styles.time}>{formatTime(recordingTime)}</span>
            </div>

            {/* Controls - Apple Voice Memos style */}
            <div className={styles.controls}>
                {/* Left: Pause/Resume */}
                <button
                    className={styles.controlButton}
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    aria-label={isPaused ? '再開' : '一時停止'}
                >
                    {isPaused ? (
                        <PlayCircle size={56} color="var(--primary)" />
                    ) : (
                        <PauseCircle size={56} color="var(--text-muted)" />
                    )}
                </button>

                {/* Center: Highlight */}
                <button
                    className={`${styles.highlightButton} ${highlightFlash ? styles.highlightFlash : ''}`}
                    onClick={addHighlight}
                    aria-label="ハイライト"
                    disabled={isPaused}
                >
                    <Star size={22} color="var(--warning)" weight="fill" />
                    {highlights.length > 0 && (
                        <span className={styles.highlightCount}>{highlights.length}</span>
                    )}
                </button>

                {/* Right: Stop */}
                <button
                    className={styles.controlButton}
                    onClick={stopRecording}
                    aria-label="停止"
                >
                    <StopCircle size={56} color="var(--danger)" />
                </button>
            </div>

            {/* Labels below buttons */}
            <div className={styles.controlLabels}>
                <span>{isPaused ? '再開' : '一時停止'}</span>
                <span>ハイライト</span>
                <span>完了</span>
            </div>
        </div>
    );
}
