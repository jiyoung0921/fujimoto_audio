import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getHistoryItemById } from '@/lib/db';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 });
        }

        const { historyId, format } = await request.json();

        if (!historyId || !format) {
            return NextResponse.json(
                { success: false, error: '履歴IDとフォーマットが必要です' },
                { status: 400 }
            );
        }

        const item = await getHistoryItemById(historyId, session.user.email);
        if (!item) {
            return NextResponse.json({ success: false, error: '履歴が見つかりません' }, { status: 404 });
        }

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        if (format === 'txt') {
            const content = [
                '音声文字起こし結果',
                '==================',
                `元ファイル: ${item.originalName}`,
                `作成日時: ${new Date(item.createdAt).toLocaleString('ja-JP')}`,
                '',
                item.summaryText ? '--- 要約 ---' : '',
                item.summaryText || '',
                item.summaryText ? '' : '',
                '--- 全文 ---',
                item.transcriptionText,
            ]
                .filter((line) => line !== undefined)
                .join('\n');

            return new NextResponse(content, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Content-Disposition': `attachment; filename="transcription_${dateStr}.txt"`,
                },
            });
        }

        if (format === 'markdown') {
            const content = [
                '# 音声文字起こし結果',
                '',
                `> **元ファイル:** ${item.originalName}`,
                `> **作成日時:** ${new Date(item.createdAt).toLocaleString('ja-JP')}`,
                '',
                item.summaryText ? '## 要約' : '',
                item.summaryText || '',
                item.summaryText ? '' : '',
                '## 全文',
                '',
                item.transcriptionText,
            ]
                .filter((line) => line !== undefined)
                .join('\n');

            return new NextResponse(content, {
                headers: {
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Content-Disposition': `attachment; filename="transcription_${dateStr}.md"`,
                },
            });
        }

        return NextResponse.json(
            { success: false, error: 'サポートされていないフォーマットです' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { success: false, error: 'エクスポートに失敗しました' },
            { status: 500 }
        );
    }
}
