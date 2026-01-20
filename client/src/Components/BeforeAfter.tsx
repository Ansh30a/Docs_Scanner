interface Props {
  original: string;
  processed: string;
  warning: boolean;
}

export default function BeforeAfter({ original, processed, warning }: Props) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processed;
    link.download = `scanned-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-1">Original</h3>
          <img src={original} alt="Original" className="rounded border w-full" />
        </div>

        <div>
          <h3 className="font-semibold mb-1">Scanned</h3>
          <img src={processed} alt="Scanned" className="rounded border w-full" />
          {warning && (
            <p className="text-yellow-600 text-sm mt-2">
              Auto-crop fallback used. Review result.
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mt-4 justify-center">
        <button 
          onClick={handleDownload}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Download Scanned Image
        </button>
      </div>
    </div>
  );
}