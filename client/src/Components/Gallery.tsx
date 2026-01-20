import { useEffect, useState } from 'react';
import api from '../Services/api';
import type { UploadRecord } from '../Types/upload';
import BeforeAfter from './BeforeAfter';

export default function Gallery() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [selected, setSelected] = useState<UploadRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUploads = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/upload");
      setUploads(res.data);
    } catch (err) {
      setError("Failed to load uploads!!!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  if (loading) {
    return <div className="mt-6 text-center">Loading your scans...</div>;
  }

  if (error) {
    return <div className="mt-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Your Scans</h2>

      {uploads.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No scans yet. Upload your first document!</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {uploads.map((u, i) => (
              <img
                key={i}
                src={`http://localhost:5000${u.processedUrl}`}
                alt="Processed document"
                className="border rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelected(u)}
              />
            ))}
          </div>

          {selected && (
            <BeforeAfter
              original={`http://localhost:5000${selected.originalUrl}`}
              processed={`http://localhost:5000${selected.processedUrl}`}
              warning={selected.warning}
            />
          )}
        </>
      )}
    </div>
  );
};
