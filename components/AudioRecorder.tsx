'use client';

import { useState, useRef, useEffect } from 'react';
import { generateFilename } from '@/lib/utils';
import { Microphone, Play, Pause, Stop } from './Icons';
import styles from './AudioRecorder.module.css';

interface AudioRecorderProps {
    onRecordingComplete: (blob: Blob, filename: string) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
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
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('マイクへのアクセスに失敗しました');
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

    return (
        <div className={styles.recorder}>
            {/* Main Recording Button */}
            <button
                className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
            >
                {isRecording ? (
                    <Stop size={48} weight="fill" />
                ) : (
                    <Microphone size={48} weight="fill" />
                )}
            </button>

            {/* Timer */}
            {isRecording && (
                <div className={styles.timer}>
                    <span className={styles.timerDot}></span>
                    {formatTime(recordingTime)}
                </div>
            )}

            {/* Hint Text */}
            {!isRecording && (
                <p className={styles.hint}>タップして録音開始</p>
            )}

            {/* Control Buttons (visible when recording) */}
            {isRecording && (
                <div className={styles.controls}>
                    {!isPaused ? (
                        <button onClick={pauseRecording} className="btn btn-outline">
                            <Pause size={20} />
                            一時停止
                        </button>
                    ) : (
                        <button onClick={resumeRecording} className="btn btn-primary">
                            <Play size={20} />
                            再開
                        </button>
                    )}
                </div>
            )}

            {/* Waveform Animation */}
            {isRecording && !isPaused && (
                <div className={styles.waveform}>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            )}
        </div>
    );
}
