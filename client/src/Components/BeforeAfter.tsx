interface Props {
  original: string;
  processed: string;
  warning: boolean;
};

export default function BeforeAfter({ original, processed, warning }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <h3 className="font-semibold mb-1">Original</h3>
        <img src={original} className="rounded border" />
      </div>

      <div>
        <h3 className="font-semibold mb-1">Scanned</h3>
        <img src={processed} className="rounded border" />
        {warning && (
          <p className="text-yellow-600 text-sm mt-2">
            Auto-crop fallback used. Review result.
          </p>
        )}
      </div>
    </div>
  );
};
