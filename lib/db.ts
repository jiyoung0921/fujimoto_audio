import { createClient, Client } from '@libsql/client';
import { HistoryItem } from '@/types';

// Turso client instance
let client: Client | null = null;

function getClient(): Client {
    if (!client) {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url) {
            throw new Error('TURSO_DATABASE_URL environment variable is not set');
        }

        // For local development, use local SQLite file
        if (process.env.NODE_ENV === 'development' && !url.startsWith('libsql://')) {
            client = createClient({
                url: 'file:transcription.db',
            });
        } else {
            // For production, use Turso cloud database
            if (!authToken) {
                throw new Error('TURSO_AUTH_TOKEN environment variable is not set');
            }
            client = createClient({
                url,
                authToken,
            });
        }

        initializeDb();
    }
    return client;
}

async function initializeDb() {
    const db = getClient();
    await db.execute(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      fileType TEXT NOT NULL,
      fileSize INTEGER NOT NULL,
      transcriptionText TEXT NOT NULL,
      docxFileId TEXT NOT NULL,
      docxFileUrl TEXT NOT NULL,
      audioFilePath TEXT,
      createdAt TEXT NOT NULL,
      userId TEXT NOT NULL
    )
  `);
}

export async function addHistoryItem(item: Omit<HistoryItem, 'id'>): Promise<number> {
    const db = getClient();
    const result = await db.execute({
        sql: `
      INSERT INTO history (
        filename, originalName, fileType, fileSize,
        transcriptionText, docxFileId, docxFileUrl,
        audioFilePath, createdAt, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        args: [
            item.filename,
            item.originalName,
            item.fileType,
            item.fileSize,
            item.transcriptionText,
            item.docxFileId,
            item.docxFileUrl,
            item.audioFilePath || null,
            item.createdAt,
            item.userId,
        ],
    });

    return Number(result.lastInsertRowid);
}

export async function getHistoryByUser(userId: string): Promise<HistoryItem[]> {
    const db = getClient();
    const result = await db.execute({
        sql: 'SELECT * FROM history WHERE userId = ? ORDER BY createdAt DESC',
        args: [userId],
    });

    return result.rows as unknown as HistoryItem[];
}

export async function deleteHistoryItem(id: number, userId: string): Promise<boolean> {
    const db = getClient();
    const result = await db.execute({
        sql: 'DELETE FROM history WHERE id = ? AND userId = ?',
        args: [id, userId],
    });

    return result.rowsAffected > 0;
}

export async function updateHistoryFilename(id: number, userId: string, newFilename: string): Promise<boolean> {
    const db = getClient();
    const result = await db.execute({
        sql: 'UPDATE history SET filename = ? WHERE id = ? AND userId = ?',
        args: [newFilename, id, userId],
    });

    return result.rowsAffected > 0;
}

export function closeDb() {
    // Turso client doesn't require explicit closing
    client = null;
}
