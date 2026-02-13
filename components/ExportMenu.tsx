'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ExportMenu.module.css';

interface ExportMenuProps {
    historyId: number;
    docxUrl: string;
}

export default function ExportMenu({ historyId, docxUrl }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = async (format: string) => {
        if (format === 'docx') {
            window.open(docxUrl, '_blank');
            setIsOpen(false);
            return;
        }

        setLoading(format);
        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ historyId, format }),
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ext = format === 'markdown' ? 'md' : format;
            a.download = `transcription.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('エクスポートに失敗しました');
        } finally {
            setLoading(null);
            setIsOpen(false);
        }
    };

    const formats = [
        { id: 'docx', name: 'DOCX', icon: '📄', desc: 'Google Drive' },
        { id: 'txt', name: 'TXT', icon: '📝', desc: 'テキストファイル' },
        { id: 'markdown', name: 'Markdown', icon: '📋', desc: 'Markdownファイル' },
    ];

    return (
        <div className={styles.container} ref={menuRef}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>📥</span>
                <span>エクスポート</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {formats.map((f) => (
                        <button
                            key={f.id}
                            className={styles.option}
                            onClick={() => handleExport(f.id)}
                            disabled={loading !== null}
                        >
                            <span className={styles.optionIcon}>{f.icon}</span>
                            <div className={styles.optionInfo}>
                                <span className={styles.optionName}>{f.name}</span>
                                <span className={styles.optionDesc}>{f.desc}</span>
                            </div>
                            {loading === f.id && (
                                <div className="loading-spinner"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
