import type { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import './globals.css';

export const metadata: Metadata = {
    title: 'VoiceDoc - 音声文字起こし',
    description: '音声を録音・アップロードして自動で文字起こしを行うアプリ',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
            <body>
                <SessionProvider>
                    <div className="app-container">
                        <Header />
                        <main className="page-content">{children}</main>
                        <BottomNav />
                    </div>
                </SessionProvider>
            </body>
        </html>
    );
}
