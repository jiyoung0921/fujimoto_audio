'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HistoryItem, DetailTab } from '@/types';
import { summaryTemplates } from '@/lib/summary-templates';
import AskPanel from '@/components/AskPanel';
import ExportMenu from '@/components/ExportMenu';
import AudioPlayer from '@/components/AudioPlayer';
import styles from './page.module.css';

export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [item, setItem] = useState<HistoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DetailTab>('transcript');
    const [summarizing, setSummarizing] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('minutes');

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const response = await fetch(`/api/history/${id}`);
            const data = await response.json();
            if (data.success) {
                setItem(data.item);
                if (data.item.summaryTemplate) {
                    setSelectedTemplate(data.item.summaryTemplate);
                }
            } else {
                alert(data.error || 'データの取得に失敗しました');
                router.push('/history');
            }
        } catch (error) {
            console.error('Fetch detail error:', error);
            router.push('/history');
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async () => {
        if (!item) return;
        setSummarizing(true);

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    historyId: item.id,
                    templateId: selectedTemplate,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setItem({
                    ...item,
                    summaryText: data.summary,
                    summaryTemplate: selectedTemplate,
                });
            } else {
                alert(data.error || '要約の生成に失敗しました');
            }
        } catch (error) {
            console.error('Summarize error:', error);
            alert('要約の生成に失敗しました');
        } finally {
            setSummarizing(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="loading-spinner"></div>
                <p>読み込み中...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className={styles.loading}>
                <p>データが見つかりません</p>
            </div>
        );
    }

    const tabs: { id: DetailTab; label: string; icon: string }[] = [
        { id: 'transcript', label: '全文', icon: '📄' },
        { id: 'summary', label: '要約', icon: '📝' },
        { id: 'ask', label: 'AI質問', icon: '💬' },
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={() => router.push('/history')} className={styles.backBtn}>
                    ← 戻る
                </button>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>{item.filename}</h1>
                    <div className={styles.meta}>
                        <span className={styles.badge}>
                            {item.fileType.split('/')[1] || item.fileType}
                        </span>
                        <span className={styles.metaText}>
                            {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span className={styles.metaText}>
                            {new Date(item.createdAt).toLocaleString('ja-JP')}
                        </span>
                    </div>
                </div>
                <ExportMenu historyId={item.id} docxUrl={item.docxFileUrl} />
            </div>

            {/* Audio Player */}
            {item.audioFilePath && (
                <div className={styles.audioSection}>
                    <AudioPlayer src={item.audioFilePath} filename={item.filename} />
                </div>
            )}

            {/* Tabs */}
            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={styles.content}>
                {/* Transcript Tab */}
                {activeTab === 'transcript' && (
                    <div className={styles.transcriptTab}>
                        <div className={styles.transcriptText}>
                            {item.transcriptionText.split('\n').map((line, i) => (
                                <p key={i} className={styles.transcriptLine}>
                                    {line || <br />}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary Tab */}
                {activeTab === 'summary' && (
                    <div className={styles.summaryTab}>
                        <div className={styles.templateSelector}>
                            <label className={styles.templateLabel}>テンプレート</label>
                            <div className={styles.templateGrid}>
                                {summaryTemplates.map((t) => (
                                    <button
                                        key={t.id}
                                        className={`${styles.templateBtn} ${selectedTemplate === t.id ? styles.templateBtnActive : ''
                                            }`}
                                        onClick={() => setSelectedTemplate(t.id)}
                                    >
                                        <span className={styles.templateIcon}>{t.icon}</span>
                                        <span className={styles.templateName}>{t.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                className={styles.generateBtn}
                                onClick={handleSummarize}
                                disabled={summarizing}
                            >
                                {summarizing ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        <span>要約を生成中...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span>
                                        <span>
                                            {item.summaryText ? '再要約する' : '要約を生成'}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>

                        {item.summaryText ? (
                            <div className={styles.summaryContent}>
                                {item.summaryText.split('\n').map((line, i) => {
                                    if (line.startsWith('## ')) {
                                        return (
                                            <h2 key={i} className={styles.summaryH2}>
                                                {line.replace('## ', '')}
                                            </h2>
                                        );
                                    }
                                    if (line.startsWith('### ')) {
                                        return (
                                            <h3 key={i} className={styles.summaryH3}>
                                                {line.replace('### ', '')}
                                            </h3>
                                        );
                                    }
                                    if (line.startsWith('- [ ] ')) {
                                        return (
                                            <div key={i} className={styles.todoItem}>
                                                <span className={styles.todoCheck}>☐</span>
                                                <span>{line.replace('- [ ] ', '')}</span>
                                            </div>
                                        );
                                    }
                                    if (line.startsWith('- ')) {
                                        return (
                                            <div key={i} className={styles.listItem}>
                                                <span className={styles.listBullet}>•</span>
                                                <span>{line.replace('- ', '')}</span>
                                            </div>
                                        );
                                    }
                                    if (line.match(/^\d+\.\s/)) {
                                        return (
                                            <div key={i} className={styles.listItem}>
                                                <span>{line}</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <p key={i} className={styles.summaryLine}>
                                            {line || <br />}
                                        </p>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.noSummary}>
                                <p>📝 まだ要約がありません</p>
                                <p>上のテンプレートを選択して「要約を生成」をクリックしてください</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Ask Tab */}
                {activeTab === 'ask' && (
                    <div className={styles.askTab}>
                        <AskPanel historyId={item.id} />
                    </div>
                )}
            </div>
        </div>
    );
}
