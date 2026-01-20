import { useState } from 'react';
import api from '../Services/api';

interface Props {
    onComplete: () => void;
};

export default function UploadBox({ onComplete }: Props) {
    const [loading , setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpload = async (file: File) => {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post('/upload', formData);
            onComplete();
        } catch {
            setError("Upload failed!!! Try again.");
        } finally {
            setLoading(false);
        };
    };

    return (
        <div className="border-2 border-dashed p-6 rounded text-center bg-white">
            <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
            />
            {loading && <p className="mt-2">Processing...</p>}
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
  );
};

