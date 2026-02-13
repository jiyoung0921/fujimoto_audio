import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getHistoryItemById } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AskResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<AskResponse>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 });
        }

        const { historyId, question } = await request.json();

        if (!historyId || !question) {
            return NextResponse.json(
                { success: false, error: '履歴IDと質問が必要です' },
                { status: 400 }
            );
        }

        // Get the history item
        const item = await getHistoryItemById(historyId, session.user.email);
        if (!item) {
            return NextResponse.json({ success: false, error: '履歴が見つかりません' }, { status: 404 });
        }

        // Generate answer using Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `以下の文字起こしテキストに基づいて、ユーザーの質問に回答してください。

ルール:
- 文字起こしテキストの内容のみに基づいて回答してください
- テキストに含まれない情報については「この音声データからはその情報は確認できません」と回答してください
- 回答は簡潔で分かりやすくしてください
- 該当する部分があれば、元テキストから引用してください（「」で囲む）
- 回答の最後に、ユーザーが次に聞きたいかもしれない関連質問を2〜3個提案してください
  提案は以下の形式で出力してください:
  ---suggestions---
  - 提案質問1
  - 提案質問2
  - 提案質問3

文字起こしテキスト:
${item.transcriptionText}

ユーザーの質問: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const fullText = response.text().trim();

        // Parse answer and suggestions
        let answer = fullText;
        let suggestions: string[] = [];

        const suggestionsIndex = fullText.indexOf('---suggestions---');
        if (suggestionsIndex !== -1) {
            answer = fullText.substring(0, suggestionsIndex).trim();
            const suggestionsText = fullText.substring(suggestionsIndex + '---suggestions---'.length).trim();
            suggestions = suggestionsText
                .split('\n')
                .map((line) => line.replace(/^-\s*/, '').trim())
                .filter((line) => line.length > 0);
        }

        return NextResponse.json({
            success: true,
            answer,
            suggestions,
        });
    } catch (error) {
        console.error('Ask error:', error);
        return NextResponse.json(
            { success: false, error: 'AIへの質問に失敗しました' },
            { status: 500 }
        );
    }
}
