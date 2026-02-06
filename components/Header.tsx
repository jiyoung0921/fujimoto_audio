'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { User, SignOut } from './Icons';
import styles from './Header.module.css';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>🎤</span>
                    <span className={styles.logoText}>VoiceDoc</span>
                </div>

                <div className={styles.auth}>
                    {session ? (
                        <div className={styles.userSection}>
                            <div className={styles.userInfo}>
                                <User size={20} />
                                <span className={styles.userName}>
                                    {session.user?.name?.split(' ')[0] || 'User'}
                                </span>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className={styles.logoutBtn}
                                aria-label="ログアウト"
                            >
                                <SignOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn('google')}
                            className="btn btn-primary btn-sm"
                        >
                            ログイン
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
