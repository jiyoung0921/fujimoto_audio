import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { transcribeAudio, uploadToDrive } from '@/lib/google-apis';
import { generateDocx } from '@/lib/docx-generator';
import { addHistoryItem, updateHistorySummary } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import { TranscribeResponse } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDefaultTemplate } from '@/lib/summary-templates';

export async function POST(request: NextRequest): Promise<NextResponse<TranscribeResponse>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 });
        }

        const { filePath, originalName, fileType, fileSize, folderId } = await request.json();

        if (!filePath) {
            return NextResponse.json({ success: false, error: 'ファイルパスが必要です' }, { status: 400 });
        }

        // デバッグ: 環境変数の確認
        console.log('=== Transcribe API Debug ===');
        console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
        console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
        console.log('File path:', filePath);
        console.log('Original name:', originalName);
        console.log('File type:', fileType);

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set in environment variables');
            return NextResponse.json({
                success: false,
                error: 'API キーが設定されていません。環境変数を確認してください。'
            }, { status: 500 });
        }

        // Transcribe audio
        console.log('Starting transcription...');
        const transcription = await transcribeAudio(filePath);
        console.log('Transcription completed. Length:', transcription.length);

        if (!transcription) {
            return NextResponse.json({ success: false, error: '文字起こし結果が空です' }, { status: 400 });
        }

        // Save audio file to /tmp directory (Vercel compatible)
        const uploadsDir = '/tmp/uploads';
        await fs.mkdir(uploadsDir, { recursive: true });

        const audioFileName = `audio_${Date.now()}_${path.basename(originalName)}`;
        const audioSavePath = path.join(uploadsDir, audioFileName);
        const audioPublicPath = `/tmp/uploads/${audioFileName}`; // Store the actual path in DB

        // Copy audio file to uploads directory
        await fs.copyFile(filePath, audioSavePath);

        // Generate DOCX
        const docxPath = await generateDocx(transcription, originalName);

        // Upload to Google Drive
        const accessToken = (session as any).accessToken;
        const { fileId, webViewLink } = await uploadToDrive(
            docxPath,
            `transcription_${path.basename(originalName, path.extname(originalName))}.docx`,
            accessToken,
            folderId || undefined
        );

        // Save to history
        const historyId = await addHistoryItem({
            filename: path.basename(filePath),
            originalName,
            fileType,
            fileSize,
            transcriptionText: transcription,
            docxFileId: fileId,
            docxFileUrl: webViewLink,
            audioFilePath: audioPublicPath,
            createdAt: new Date().toISOString(),
            userId: session.user.email,
        });

        // Auto-summarize in the background (don't block the response)
        if (transcription.length >= 100) {
            const autoSummarize = async () => {
                try {
                    const template = getDefaultTemplate();
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                    const prompt = `${template.prompt}\n\n文字起こしテキスト:\n${transcription}`;
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const summary = response.text().trim();

                    await updateHistorySummary(historyId, session.user!.email!, summary, template.id);
                    console.log('Auto-summary generated for history:', historyId);
                } catch (err) {
                    console.error('Auto-summarize failed (non-blocking):', err);
                }
            };
            // Fire and forget - don't await
            autoSummarize();
        }

        // Clean up temp files
        await fs.unlink(filePath).catch(() => { });
        await fs.unlink(docxPath).catch(() => { });

        return NextResponse.json({
            success: true,
            transcription,
            docxUrl: webViewLink,
            historyId,
        });
    } catch (error) {
        console.error('Transcription error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            filePath: request.body ? JSON.stringify(request.body) : 'No body',
        });

        // エラーメッセージをより具体的に
        let errorMessage = '文字起こし処理に失敗しました';
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                errorMessage = 'API キーの設定に問題があります';
            } else if (error.message.includes('quota')) {
                errorMessage = 'API の使用制限に達しました';
            } else if (error.message.includes('network')) {
                errorMessage = 'ネットワークエラーが発生しました';
            }
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
