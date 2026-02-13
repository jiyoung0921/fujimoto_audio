import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getHistoryItemById } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 });
        }

        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ success: false, error: '無効なIDです' }, { status: 400 });
        }

        const item = await getHistoryItemById(id, session.user.email);
        if (!item) {
            return NextResponse.json({ success: false, error: '履歴が見つかりません' }, { status: 404 });
        }

        return NextResponse.json({ success: true, item });
    } catch (error) {
        console.error('History detail fetch error:', error);
        return NextResponse.json(
            { success: false, error: '履歴の取得に失敗しました' },
            { status: 500 }
        );
    }
}
