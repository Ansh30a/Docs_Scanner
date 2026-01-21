export interface UploadRecord {
    id: string;
    docId: string;
    userId: string;
    filename: string;
    originalUrl: string;
    processedUrl: string;
    warning: boolean;
    createdAt: string;
};