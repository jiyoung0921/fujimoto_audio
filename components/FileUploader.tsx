'use client';

import { useState } from 'react';
import { Upload, Folder } from './Icons';
import styles from './FileUploader.module.css';

interface FileUploaderProps {
    onFileSelected: (file: File) => void;
}

export default function FileUploader({ onFileSelected }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            onFileSelected(file);
        } else {
            alert('音声ファイルを選択してください');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelected(file);
        }
    };

    return (
        <div className={styles.container}>
            <div
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className={styles.iconWrapper}>
                    <Upload size={32} />
                </div>
                <p className={styles.title}>ファイルをアップロード</p>
                <p className={styles.subtitle}>ドラッグ&ドロップ または</p>

                <label className={`btn btn-outline ${styles.selectBtn}`}>
                    <Folder size={18} />
                    ファイルを選択
                    <input
                        type="file"
                        accept="audio/*,video/*,.mp3,.m4a,.wav,.ogg,.webm,.mp4,.aac,*/*"
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                    />
                </label>

                <p className={styles.formats}>
                    MP3, M4A, WAV, OGG, WebM
                </p>
            </div>
        </div>
    );
}
