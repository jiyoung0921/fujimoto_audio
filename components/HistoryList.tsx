'use client';

import { useState, useEffect } from 'react';
import { HistoryItem } from '@/types';
import { MusicNote, Document, Trash, Pencil, Check, X, ExternalLink, Inbox } from './Icons';
import SearchBar from './SearchBar';
import AudioPlayer from './AudioPlayer';
import { useRouter } from 'next/navigation';
import styles from './HistoryList.module.css';

export default function HistoryList() {
    const router = useRouter();
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            if (data.success) {
                setItems(data.items || []);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('この履歴を削除しますか？')) {
            return;
        }

        try {
            const response = await fetch('/api/history', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();
            if (data.success) {
                setItems(items.filter((item) => item.id !== id));
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('削除に失敗しました');
        }
    };

    const startEditing = (item: HistoryItem) => {
        setEditingId(item.id);
        setEditingName(item.filename);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
    };

    const saveRename = async (item: HistoryItem) => {
        if (!editingName.trim()) {
            alert('ファイル名を入力してください');
            return;
        }

        try {
            const response = await fetch('/api/drive/rename', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    historyId: item.id,
                    newName: editingName,
                    driveFileId: item.docxFileId,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setItems(
                    items.map((i) =>
                        i.id === item.id ? { ...i, filename: editingName } : i
                    )
                );
                setEditingId(null);
                setEditingName('');
            } else {
                alert(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Rename error:', error);
            alert('ファイル名の変更に失敗しました');
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Filter items based on search query
    const filteredItems = items.filter((item) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.filename.toLowerCase().includes(query) ||
            item.transcriptionText.toLowerCase().includes(query)
        );
    });

    if (items.length === 0) {
        return (
            <div className={styles.empty}>
                <Inbox size={48} color="var(--text-muted)" />
                <p>履歴がありません</p>
                <span>録音またはアップロードすると、ここに表示されます</span>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <SearchBar
                onSearch={setSearchQuery}
                placeholder="ファイル名または内容で検索..."
            />

            {filteredItems.length === 0 ? (
                <div className={styles.empty}>
                    <Inbox size={48} color="var(--text-muted)" />
                    <p>検索結果がありません</p>
                    <span>別のキーワードで試してみてください</span>
                </div>
            ) : (
                <div className={styles.list}>
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={styles.item}
                            onClick={() => {
                                if (editingId !== item.id) {
                                    router.push(`/history/${item.id}`);
                                }
                            }}
                            style={{ cursor: editingId === item.id ? 'default' : 'pointer' }}
                        >
                            <div className={styles.itemHeader}>
                                <div className={styles.fileIcon}>
                                    <MusicNote size={20} color="var(--primary)" />
                                </div>

                                {editingId === item.id ? (
                                    <div className={styles.editContainer}>
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className={styles.editInput}
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => saveRename(item)}
                                            className={styles.editAction}
                                            aria-label="保存"
                                        >
                                            <Check size={18} color="var(--success)" />
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className={styles.editAction}
                                            aria-label="キャンセル"
                                        >
                                            <X size={18} color="var(--text-muted)" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.fileInfo}>
                                        <h3 className={styles.filename}>
                                            <span>{item.filename}</span>
                                            <button
                                                onClick={() => startEditing(item)}
                                                className={styles.editButton}
                                                aria-label="名前を変更"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        </h3>
                                        <span className={styles.date}>
                                            {new Date(item.createdAt).toLocaleString('ja-JP')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.itemBody}>
                                <div className={styles.meta}>
                                    <span className={styles.badge}>{item.fileType.split('/')[1] || item.fileType}</span>
                                    <span className={styles.size}>
                                        {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>

                                <p className={styles.transcription}>
                                    {item.transcriptionText.substring(0, 150)}
                                    {item.transcriptionText.length > 150 && '...'}
                                </p>

                                {item.summaryText && (
                                    <div className={styles.summaryPreview}>
                                        <span className={styles.summaryBadge}>📝 要約</span>
                                        <p className={styles.summaryText}>
                                            {item.summaryText.substring(0, 80)}
                                            {item.summaryText.length > 80 && '...'}
                                        </p>
                                    </div>
                                )}

                                {item.audioFilePath && (
                                    <AudioPlayer
                                        src={item.audioFilePath}
                                        filename={item.filename}
                                    />
                                )}
                            </div>

                            <div className={styles.itemFooter}>
                                <a
                                    href={item.docxFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.openButton}
                                >
                                    <Document size={18} />
                                    <span>DOCX</span>
                                    <ExternalLink size={14} />
                                </a>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className={styles.deleteButton}
                                    aria-label="削除"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
