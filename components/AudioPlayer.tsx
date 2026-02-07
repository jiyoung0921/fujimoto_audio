'use client';

import { useState, useRef, useEffect } from 'react';
import { PlayCircle, PauseCircle } from './Icons';
import styles from './AudioPlayer.module.css';

interface AudioPlayerProps {
    src: string;
    filename?: string;
}

export default function AudioPlayer({ src, filename }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [src]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time: number): string => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading && !duration) {
        return (
            <div className={styles.player}>
                <div className={styles.loadingText}>読み込み中...</div>
            </div>
        );
    }

    return (
        <div className={styles.player}>
            <audio ref={audioRef} src={src} preload="metadata" />

            <button
                onClick={togglePlay}
                className={styles.playButton}
                aria-label={isPlaying ? '一時停止' : '再生'}
            >
                {isPlaying ? (
                    <PauseCircle size={32} color="var(--primary)" />
                ) : (
                    <PlayCircle size={32} color="var(--primary)" />
                )}
            </button>

            <div className={styles.controls}>
                {filename && <div className={styles.filename}>{filename}</div>}

                <div className={styles.progressContainer}>
                    <span className={styles.time}>{formatTime(currentTime)}</span>

                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className={styles.seekBar}
                        style={{
                            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(currentTime / duration) * 100}%, var(--gray-200) ${(currentTime / duration) * 100}%, var(--gray-200) 100%)`
                        }}
                    />

                    <span className={styles.time}>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}
