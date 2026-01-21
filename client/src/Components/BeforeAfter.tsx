import { useState } from 'react';
import type { UploadRecord } from '../Types/upload';

interface Props {
    upload: UploadRecord;
    onClose: () => void;
    onDelete: () => void;
}

export default function BeforeAfter({ upload, onClose, onDelete }: Props) {
    const [zoomedImage, setZoomedImage] = useState<'original' | 'processed' | null>(null);

    const handleDownload = (url: string, suffix: string) => {
        const link = document.createElement('a');
        link.href = url;
        const baseName = upload.filename?.replace(/\.[^/.]+$/, '') || 'document';
        link.download = `${baseName}-${suffix}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="before-after-modal">
                <div className="modal-header">
                    <h3>{upload.filename || 'Document'}</h3>
                    <button className="close-btn" onClick={onClose} title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>

                <div className="comparison-grid">
                    <div className="comparison-panel">
                        <div className="panel-header">
                            <span className="panel-label">Original</span>
                        </div>
                        <div className="image-container" onClick={() => setZoomedImage('original')}>
                            <img src={upload.originalUrl} alt="Original document" />
                            <div className="zoom-hint">Click to zoom</div>
                        </div>
                        <button
                            className="download-btn secondary"
                            onClick={() => handleDownload(upload.originalUrl, 'original')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                            </svg>
                            Download Original
                        </button>
                    </div>

                    <div className="comparison-panel">
                        <div className="panel-header">
                            <span className="panel-label scanned">Scanned</span>
                            {upload.warning && (
                                <span className="warning-tag">Fallback used</span>
                            )}
                        </div>
                        <div className="image-container" onClick={() => setZoomedImage('processed')}>
                            <img src={upload.processedUrl} alt="Scanned document" />
                            <div className="zoom-hint">Click to zoom</div>
                        </div>
                        <button
                            className="download-btn primary"
                            onClick={() => handleDownload(upload.processedUrl, 'scanned')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                            </svg>
                            Download Scanned
                        </button>
                    </div>
                </div>

                {upload.warning && (
                    <div className="warning-message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                        Document edges could not be detected with high confidence. The original image was used as fallback.
                    </div>
                )}

                <div className="modal-actions">
                    <button className="delete-btn-large" onClick={onDelete}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                        Delete Document
                    </button>
                </div>
            </div>

            {zoomedImage && (
                <div className="zoom-modal" onClick={() => setZoomedImage(null)}>
                    <img
                        src={zoomedImage === 'original' ? upload.originalUrl : upload.processedUrl}
                        alt={zoomedImage === 'original' ? 'Original zoomed' : 'Scanned zoomed'}
                    />
                    <p className="zoom-hint-text">Click anywhere to close</p>
                </div>
            )}
        </>
    );
};
