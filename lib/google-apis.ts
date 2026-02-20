import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { google } from 'googleapis';
import { promises as fs } from 'fs';

// Threshold: Files larger than this use File API instead of inline base64
// Gemini inline limit is 20MB base64, so we use File API for anything over 15MB raw
const FILE_API_THRESHOLD_BYTES = 15 * 1024 * 1024; // 15MB

// Gemini 2.5 Flash for Audio Transcription - supports up to 9.5 hours of audio
export async function transcribeAudio(audioFilePath: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const TRANSCRIPTION_PROMPT = `この音声ファイルに含まれる発話内容を正確に書き起こしてください。

指示:
- 音声に含まれる発話のみを出力してください
- 句読点を適切に付けて読みやすく整形してください
- 音声が聞き取れない場合や無音の場合は「（音声なし）」とだけ出力してください
- このプロンプト（指示文）は絶対に出力に含めないでください
- 余計な説明や注釈は不要です。発話内容のみを出力してください`;

    // Determine MIME type based on file extension
    const ext = audioFilePath.toLowerCase().split('.').pop();
    let mimeType: string = 'audio/webm';
    if (ext === 'mp3') mimeType = 'audio/mp3';
    else if (ext === 'm4a') mimeType = 'audio/mp4';
    else if (ext === 'mp4') mimeType = 'audio/mp4';
    else if (ext === 'wav') mimeType = 'audio/wav';
    else if (ext === 'ogg') mimeType = 'audio/ogg';
    else if (ext === 'webm') mimeType = 'audio/webm';

    try {
        const stats = await fs.stat(audioFilePath);
        const fileSizeBytes = stats.size;
        console.log(`[transcribeAudio] File size: ${(fileSizeBytes / 1024 / 1024).toFixed(2)} MB, MIME: ${mimeType}`);

        let transcription: string;

        if (fileSizeBytes > FILE_API_THRESHOLD_BYTES) {
            // --- Large file: use Gemini File API ---
            console.log('[transcribeAudio] Using Gemini File API for large file...');
            transcription = await transcribeWithFileAPI(audioFilePath, mimeType, model, TRANSCRIPTION_PROMPT);
        } else {
            // --- Small file: use inline base64 (faster, no extra API call) ---
            console.log('[transcribeAudio] Using inline base64 for small file...');
            const audioData = await fs.readFile(audioFilePath);
            const base64Audio = audioData.toString('base64');

            const result = await model.generateContent([
                { inlineData: { data: base64Audio, mimeType } },
                TRANSCRIPTION_PROMPT,
            ]);
            const response = await result.response;
            transcription = response.text();
        }

        if (!transcription || transcription.trim() === '') {
            return '（音声なし）';
        }

        // Filter out accidental prompt leakage
        const leakagePatterns = ['この音声ファイル', '書き起こし', '指示:', 'TRANSCRIPTION_PROMPT'];
        if (leakagePatterns.some(p => transcription.includes(p))) {
            console.warn('[transcribeAudio] Possible prompt leakage detected, returning empty result');
            return '（音声なし）';
        }

        return transcription.trim();
    } catch (error) {
        console.error('[transcribeAudio] Error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('文字起こしに失敗しました');
    }
}

/**
 * Upload file to Gemini File API, wait for processing, then transcribe.
 * Supports audio files up to 9.5 hours / ~2GB.
 */
async function transcribeWithFileAPI(
    audioFilePath: string,
    mimeType: string,
    model: any,
    prompt: string
): Promise<string> {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

    let uploadedFile: any = null;
    try {
        // Upload the file
        console.log('[FileAPI] Uploading file to Gemini File API...');
        const uploadResult = await fileManager.uploadFile(audioFilePath, {
            mimeType,
            displayName: `audio_${Date.now()}`,
        });
        uploadedFile = uploadResult.file;
        console.log(`[FileAPI] File uploaded: ${uploadedFile.name}, state: ${uploadedFile.state}`);

        // Poll until file is ACTIVE (processing can take 10-60s for large files)
        let file = uploadedFile;
        let attempts = 0;
        const MAX_POLL_ATTEMPTS = 60; // 60 * 5s = 5 minutes max wait
        while (file.state === FileState.PROCESSING) {
            if (attempts >= MAX_POLL_ATTEMPTS) {
                throw new Error('Gemini File APIの処理がタイムアウトしました（5分超過）');
            }
            await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
            file = await fileManager.getFile(file.name);
            attempts++;
            console.log(`[FileAPI] File state: ${file.state} (attempt ${attempts}/${MAX_POLL_ATTEMPTS})`);
        }

        if (file.state === FileState.FAILED) {
            throw new Error('Gemini File APIでの音声処理に失敗しました');
        }

        // Transcribe using the File API URI
        console.log('[FileAPI] Starting transcription...');
        const result = await model.generateContent([
            { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
            prompt,
        ]);
        const response = await result.response;
        const transcription = response.text();
        console.log(`[FileAPI] Transcription complete: ${transcription.length} chars`);
        return transcription;
    } finally {
        // Always clean up the uploaded file from Gemini servers
        if (uploadedFile?.name) {
            fileManager.deleteFile(uploadedFile.name).catch(err => {
                console.warn('[FileAPI] Failed to delete uploaded file:', err);
            });
        }
    }
}


// AI Summary and Structure Generation
export async function summarizeAndStructure(text: string): Promise<{
    summary: string;
    sections: Array<{ heading: string; content: string }>;
}> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    try {
        const prompt = `以下の文字起こしテキストを分析して、以下のJSON形式で返してください：

{
  "summary": "全体の要約（200〜300文字程度）",
  "sections": [
    {
      "heading": "セクション1の見出し（簡潔に）",
      "content": "セクション1の内容"
    },
    {
      "heading": "セクション2の見出し（簡潔に）",
      "content": "セクション2の内容"
    }
  ]
}

指示:
- 要約は重要なポイントを簡潔にまとめてください
- セクションは3〜5個程度に分割してください
- 見出しは内容を表す簡潔なタイトルにしてください
- 各セクションの内容は元のテキストを保持しながら、読みやすく整理してください
- **必ずJSON形式のみを出力してください。他の説明文は不要です。**

文字起こしテキスト:
${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let responseText = response.text().trim();

        // Remove markdown code block if present
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```\n?/g, '');
        }

        const structured = JSON.parse(responseText);

        return {
            summary: structured.summary || '',
            sections: structured.sections || [],
        };
    } catch (error) {
        console.error('AI summary generation error:', error);
        // Fallback: return original text as a single section
        return {
            summary: text.substring(0, 300) + (text.length > 300 ? '...' : ''),
            sections: [
                {
                    heading: '内容',
                    content: text,
                },
            ],
        };
    }
}

// Google Drive API
export async function uploadToDrive(
    filePath: string,
    filename: string,
    accessToken: string,
    folderId?: string
): Promise<{ fileId: string; webViewLink: string }> {
    const drive = google.drive({ version: 'v3' });

    const fileMetadata = {
        name: filename,
        parents: folderId
            ? [folderId]
            : process.env.GOOGLE_DRIVE_FOLDER_ID
                ? [process.env.GOOGLE_DRIVE_FOLDER_ID]
                : undefined,
    };

    const media = {
        mimeType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        body: await fs.readFile(filePath).then((buffer) => {
            const { Readable } = require('stream');
            return Readable.from(buffer);
        }),
    };

    try {
        const response = await drive.files.create(
            {
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink',
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return {
            fileId: response.data.id!,
            webViewLink: response.data.webViewLink!,
        };
    } catch (error) {
        console.error('Google Drive upload error:', error);
        throw new Error('Google Driveへのアップロードに失敗しました');
    }
}

// List Drive Folders
export async function listDriveFolders(accessToken: string) {
    const drive = google.drive({ version: 'v3' });

    try {
        const response = await drive.files.list(
            {
                q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name, parents)',
                orderBy: 'name',
                pageSize: 100,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.files || [];
    } catch (error: any) {
        console.error('List folders error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        // Provide more specific error messages
        if (error.code === 401) {
            throw new Error('認証が無効です。再度ログインしてください。');
        } else if (error.code === 403) {
            throw new Error('Google Driveへのアクセス権限がありません。アプリ認証時に権限を付与してください。');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            throw new Error('Google Driveに接続できません。インターネット接続を確認してください。');
        }

        throw new Error(error.message || 'フォルダ一覧の取得に失敗しました');
    }
}

// Create Drive Folder
export async function createDriveFolder(
    name: string,
    parentId: string | undefined,
    accessToken: string
) {
    const drive = google.drive({ version: 'v3' });

    const folderMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
    };

    try {
        const response = await drive.files.create(
            {
                requestBody: folderMetadata,
                fields: 'id, name',
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Create folder error:', error);
        throw new Error('フォルダの作成に失敗しました');
    }
}

// Rename Drive File
export async function renameDriveFile(
    fileId: string,
    newName: string,
    accessToken: string
) {
    const drive = google.drive({ version: 'v3' });

    try {
        const response = await drive.files.update(
            {
                fileId: fileId,
                requestBody: { name: newName },
                fields: 'id, name, webViewLink',
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Rename file error:', error);
        throw new Error('ファイル名の変更に失敗しました');
    }
}
