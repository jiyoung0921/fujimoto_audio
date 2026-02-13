import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getHistoryItemById, updateHistorySummary } from '@/lib/db';
import { getTemplateById, getDefaultTemplate } from '@/lib/summary-templates';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SummarizeResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<SummarizeResponse>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 });
        }

        const { historyId, templateId } = await request.json();

        if (!historyId) {
            return NextResponse.json({ success: false, error: '履歴IDが必要です' }, { status: 400 });
        }

        // Get the history item
        const item = await getHistoryItemById(historyId, session.user.email);
        if (!item) {
            return NextResponse.json({ success: false, error: '履歴が見つかりません' }, { status: 404 });
        }

        // Get the template
        const template = templateId ? getTemplateById(templateId) : getDefaultTemplate();
        if (!template) {
            return NextResponse.json({ success: false, error: 'テンプレートが見つかりません' }, { status: 400 });
        }

        // Generate summary using Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `${template.prompt}

文字起こしテキスト:
${item.transcriptionText}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text().trim();

        // Save to DB
        await updateHistorySummary(historyId, session.user.email, summary, template.id);

        return NextResponse.json({
            success: true,
            summary,
        });
    } catch (error) {
        console.error('Summarize error:', error);
        return NextResponse.json(
            { success: false, error: '要約の生成に失敗しました' },
            { status: 500 }
        );
    }
}
