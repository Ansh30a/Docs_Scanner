import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import api from '../Services/api';

interface Props {
    onComplete: () => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadBox({ onComplete }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Invalid file type. Please upload PNG, JPEG, or PDF files only.";
        }
        if (file.size > MAX_SIZE_BYTES) {
            return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
        }
        return null;
    };

    const handleUpload = async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError("");
        setProgress(0);

        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post('/upload', formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                }
            });
            setProgress(100);
            onComplete();
        } catch (err: any) {
            const message = err.response?.data?.error || "Upload failed!!! Please try again.";
            setError(message);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
        e.target.value = '';
    };

    return (
        <div
            className={`upload-box ${dragActive ? 'drag-active' : ''} ${loading ? 'uploading' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={!loading ? handleClick : undefined}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {loading ? (
                <div className="upload-progress">
                    <div className="spinner"></div>
                    <p className="upload-status">Processing your document...</p>
                    {progress > 0 && progress < 100 && (
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="upload-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <p className="upload-title">
                        {dragActive ? "Drop your file here" : "Click or drag to upload"}
                    </p>
                    <p className="upload-hint">
                        PNG, JPEG, or PDF • Max {MAX_SIZE_MB}MB
                    </p>
                </>
            )}

            {error && (
                <div className="upload-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
};
