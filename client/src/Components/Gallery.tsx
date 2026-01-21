import { useEffect, useState } from 'react';
import api, { deleteUpload } from '../Services/api';
import type { UploadRecord } from '../Types/upload';
import BeforeAfter from './BeforeAfter';

interface Props {
    onRefresh?: () => void;
}

export default function Gallery({ onRefresh }: Props) {
    const [uploads, setUploads] = useState<UploadRecord[]>([]);
    const [selected, setSelected] = useState<UploadRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const loadUploads = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/upload");
            setUploads(res.data);
        } catch (err) {
            setError("Failed to load uploads. Please refresh the page.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUploads();
    }, []);

    const handleDelete = async (upload: UploadRecord, e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (!confirm(`Delete "${upload.filename || 'this document'}"? This cannot be undone.`)) {
            return;
        }

        setDeleting(upload.docId);

        try {
            await deleteUpload(upload.docId);

            // Optimistic UI update
            setUploads(prev => prev.filter(u => u.docId !== upload.docId));

            if (selected?.docId === upload.docId) {
                setSelected(null);
            }

            onRefresh?.();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete. Please try again.');
        } finally {
            setDeleting(null);
        }
    };

    const handleClose = () => {
        setSelected(null);
    };

    if (loading) {
        return (
            <div className="gallery-loading">
                <div className="spinner"></div>
                <p>Loading your scans...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gallery-error">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p>{error}</p>
                <button onClick={loadUploads} className="retry-btn">Try Again</button>
            </div>
        );
    }

    return (
        <div className="gallery">
            <h2 className="gallery-title">Your Scans</h2>

            {uploads.length === 0 ? (
                <div className="gallery-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p>No scans yet</p>
                    <span>Upload your first document to get started!</span>
                </div>
            ) : (
                <div className="gallery-grid">
                    {uploads.map((u) => (
                        <div
                            key={u.docId}
                            className={`gallery-item ${deleting === u.docId ? 'deleting' : ''}`}
                            onClick={() => setSelected(u)}
                        >
                            <img
                                src={`http://localhost:5000${u.processedUrl}`}
                                alt={u.filename || "Processed document"}
                            />
                            <div className="gallery-item-overlay">
                                <span className="gallery-item-name">{u.filename || 'Document'}</span>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => handleDelete(u, e)}
                                    disabled={deleting === u.docId}
                                    title="Delete"
                                >
                                    {deleting === u.docId ? (
                                        <div className="spinner-small"></div>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {u.warning && (
                                <div className="warning-badge" title="Auto-crop fallback used">⚠️</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <BeforeAfter
                    upload={selected}
                    onClose={handleClose}
                    onDelete={() => handleDelete(selected)}
                />
            )}
        </div>
    );
};
