'use client';

import { useState } from 'react';
import { ChatBubble, Robot, Send } from './Icons';
import styles from './AskPanel.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AskPanelProps {
    historyId: number;
    initialSuggestions?: string[];
}

export default function AskPanel({ historyId, initialSuggestions }: AskPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>(
        initialSuggestions || [
            'この会話の主な話題は何ですか？',
            '重要な決定事項はありますか？',
            'アクションアイテムをまとめてください',
        ]
    );

    const handleAsk = async (question: string) => {
        if (!question.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: question };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setSuggestions([]);

        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ historyId, question }),
            });

            const data = await response.json();
            if (data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.answer,
                };
                setMessages((prev) => [...prev, assistantMessage]);
                if (data.suggestions && data.suggestions.length > 0) {
                    setSuggestions(data.suggestions);
                }
            } else {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: `エラー: ${data.error}`,
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Ask error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: '通信エラーが発生しました。もう一度お試しください。',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAsk(input);
    };

    return (
        <div className={styles.container}>
            <div className={styles.chatArea}>
                {messages.length === 0 && (
                    <div className={styles.welcome}>
                        <div className={styles.welcomeIcon}><ChatBubble size={48} color="var(--primary)" /></div>
                        <h3>AIに質問する</h3>
                        <p>文字起こし内容について何でも聞いてください</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                            }`}
                    >
                        {msg.role === 'assistant' && (
                            <div className={styles.avatarAI}><Robot size={18} color="var(--primary)" /></div>
                        )}
                        <div className={styles.messageContent}>
                            <div className={styles.messageBubble}>
                                {msg.content.split('\n').map((line, j) => (
                                    <p key={j}>
                                        {line || <br />}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className={`${styles.message} ${styles.assistantMessage}`}>
                        <div className={styles.avatarAI}><Robot size={18} color="var(--primary)" /></div>
                        <div className={styles.messageContent}>
                            <div className={`${styles.messageBubble} ${styles.thinking}`}>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {suggestions.length > 0 && (
                <div className={styles.suggestions}>
                    {suggestions.map((q, i) => (
                        <button
                            key={i}
                            className={styles.suggestionBtn}
                            onClick={() => handleAsk(q)}
                            disabled={loading}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.inputArea}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="質問を入力..."
                    className={styles.input}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className={styles.sendBtn}
                    disabled={!input.trim() || loading}
                >
                    <Send size={18} color="white" />
                </button>
            </form>
        </div>
    );
}
