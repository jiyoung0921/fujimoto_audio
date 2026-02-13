export interface HistoryItem {
    id: number;
    filename: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    transcriptionText: string;
    docxFileId: string;
    docxFileUrl: string;
    audioFilePath?: string | null;
    summaryText?: string | null;
    summaryTemplate?: string | null;
    createdAt: string;
    userId: string;
}

export interface TranscriptionResult {
    text: string;
    confidence: number;
}

export interface UploadResponse {
    success: boolean;
    filePath?: string;
    error?: string;
}

export interface TranscribeResponse {
    success: boolean;
    transcription?: string;
    docxUrl?: string;
    historyId?: number;
    error?: string;
}

export interface HistoryResponse {
    success: boolean;
    items?: HistoryItem[];
    error?: string;
}

export interface DeleteResponse {
    success: boolean;
    error?: string;
}

export type ProcessingStep = 'upload' | 'transcribe' | 'docx' | 'drive' | 'complete' | 'error';

export interface ProcessingStatus {
    step: ProcessingStep;
    progress: number;
    message: string;
}

export interface ErrorDetail {
    code: string;
    message: string;
    stack?: string;
    timestamp: string;
}

export interface DriveFolder {
    id: string;
    name: string;
    parents?: string[];
}

export interface RenameRequest {
    historyId: number;
    newName: string;
    driveFileId: string;
}

export type TabType = 'home' | 'history' | 'settings';

export interface SummaryTemplate {
    id: string;
    name: string;
    icon: string;
    description: string;
    prompt: string;
}

export interface AskRequest {
    historyId: number;
    question: string;
}

export interface AskResponse {
    success: boolean;
    answer?: string;
    suggestions?: string[];
    error?: string;
}

export interface SummarizeRequest {
    historyId: number;
    templateId: string;
}

export interface SummarizeResponse {
    success: boolean;
    summary?: string;
    error?: string;
}

export type ExportFormat = 'txt' | 'markdown' | 'docx';

export interface ExportRequest {
    historyId: number;
    format: ExportFormat;
}

export type DetailTab = 'transcript' | 'summary' | 'ask';
