import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

// Disable Next.js default body parsing to handle large files
export const config = {
    api: {
        bodyParser: false,
    },
};

// Maximum chunk size: 50MB
const MAX_CHUNK_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 });
        }

        const formData = await request.formData();
        const chunk = formData.get('chunk') as File | null;
        const chunkIndex = parseInt(formData.get('chunkIndex') as string);
        const totalChunks = parseInt(formData.get('totalChunks') as string);
        const uploadId = formData.get('uploadId') as string;
        const filename = formData.get('filename') as string;

        if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId || !filename) {
            return NextResponse.json(
                { success: false, error: '無効なチャンクデータです' },
                { status: 400 }
            );
        }

        // Validate chunk size
        if (chunk.size > MAX_CHUNK_SIZE) {
            return NextResponse.json(
                { success: false, error: `チャンクサイズが大きすぎます (最大 ${MAX_CHUNK_SIZE / 1024 / 1024}MB)` },
                { status: 400 }
            );
        }

        // Create temp directory for this upload session
        const sessionDir = path.join('/tmp', 'chunks', uploadId);
        await fs.mkdir(sessionDir, { recursive: true });

        // Save this chunk
        const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
        const chunkPath = path.join(sessionDir, `chunk_${String(chunkIndex).padStart(6, '0')}`);
        await fs.writeFile(chunkPath, chunkBuffer);

        console.log(`[ChunkUpload] Saved chunk ${chunkIndex + 1}/${totalChunks} for upload ${uploadId} (${chunk.size} bytes)`);

        // Check if all chunks have arrived
        const chunkFiles = await fs.readdir(sessionDir);
        const receivedChunks = chunkFiles.filter(f => f.startsWith('chunk_')).length;

        if (receivedChunks < totalChunks) {
            // Not done yet - return progress
            return NextResponse.json({
                success: true,
                complete: false,
                received: receivedChunks,
                total: totalChunks,
            });
        }

        // All chunks received - assemble them
        console.log(`[ChunkUpload] All ${totalChunks} chunks received for ${uploadId}, assembling...`);

        const uploadsDir = path.join('/tmp', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        const now = new Date();
        const timestamp = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
        ].join('-') + '_' + [
            String(now.getHours()).padStart(2, '0'),
            String(now.getMinutes()).padStart(2, '0'),
            String(now.getSeconds()).padStart(2, '0'),
        ].join('-');

        const assembledFilename = `${timestamp}_${filename}`;
        const assembledPath = path.join(uploadsDir, assembledFilename);

        // Sort and concatenate chunks
        const sortedChunks = chunkFiles
            .filter(f => f.startsWith('chunk_'))
            .sort();

        const writeStream = await fs.open(assembledPath, 'w');
        try {
            for (const chunkFile of sortedChunks) {
                const chunkData = await fs.readFile(path.join(sessionDir, chunkFile));
                await writeStream.write(chunkData);
            }
        } finally {
            await writeStream.close();
        }

        // Clean up chunk directory
        await fs.rm(sessionDir, { recursive: true, force: true }).catch(() => { });

        const stats = await fs.stat(assembledPath);
        console.log(`[ChunkUpload] Assembly complete: ${assembledPath} (${stats.size} bytes)`);

        return NextResponse.json({
            success: true,
            complete: true,
            filePath: assembledPath,
            fileSize: stats.size,
        });
    } catch (error) {
        console.error('[ChunkUpload] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'チャンクアップロードに失敗しました'
            },
            { status: 500 }
        );
    }
}
