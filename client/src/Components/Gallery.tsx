import { useEffect, useState } from 'react';
import api from '../Services/api';
import type { UploadRecord } from '../Types/upload';
import BeforeAfter from './BeforeAfter';

export default function Gallery() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [selected, setSelected] = useState<UploadRecord | null>(null);

  const loadUploads = async () => {
    const res = await api.get("/uploads");
    setUploads(res.data);
  };

  useEffect(() => {
    loadUploads();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Your Scans</h2>

      <div className="grid grid-cols-3 gap-3">
        {uploads.map((u, i) => (
          <img
            key={i}
            src={u.processedUrl}
            className="border rounded cursor-pointer"
            onClick={() => setSelected(u)}
          />
        ))}
      </div>

      {selected && (
        <BeforeAfter
          original={selected.originalUrl}
          processed={selected.processedUrl}
          warning={selected.warning}
        />
      )}
    </div>
  );
};
