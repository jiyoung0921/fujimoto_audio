'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Microphone, User, SignOut } from './Icons';
import ConfirmDialog from './ConfirmDialog';
import styles from './Header.module.css';

export default function Header() {
    const { data: session, status } = useSession();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(false);
        signOut();
    };

    return (
        <>
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="ログアウトしますか？"
                message="ログアウトすると、このデバイスからアカウント情報が削除されます。"
                confirmText="ログアウト"
                cancelText="キャンセル"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />

            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <Microphone size={18} weight="fill" />
                        </div>
                        <span className={styles.logoText}>VoiceDoc</span>
                    </div>

                    <div className={styles.auth}>
                        {status === 'loading' ? (
                            <div className={styles.skeleton}></div>
                        ) : session ? (
                            <div className={styles.userMenu}>
                                <div className={styles.avatar}>
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="" />
                                    ) : (
                                        <User size={16} />
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className={styles.signOutBtn}
                                    aria-label="ログアウト"
                                >
                                    <SignOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className={styles.signInBtn}
                            >
                                ログイン
                            </button>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
