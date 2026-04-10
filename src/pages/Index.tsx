import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import WarResultCard from "@/components/WarResultCard";

const Index = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [warData, setWarData] = useState<any>(null);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.clan || !parsed.opponent) {
        setError("JSON must contain 'clan' and 'opponent' fields");
        return;
      }
      setWarData(parsed);
      setError("");
    } catch {
      setError("Invalid JSON format");
    }
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "war-result.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10" style={{ fontFamily: "var(--font-body)" }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-foreground text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", letterSpacing: 4 }}>
          COC WAR RESULT GENERATOR
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Paste your Clash of Clans war API JSON below and generate a match result image.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Input */}
          <div className="flex-1">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Paste your COC war JSON here...'
              className="w-full h-64 bg-card text-foreground border border-border rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Generate
              </button>
              {warData && (
                <button
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                >
                  Download PNG
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 flex justify-center">
            {warData ? (
              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ width: 800 }}>
                <WarResultCard ref={cardRef} data={warData} />
              </div>
            ) : (
              <div className="w-full h-64 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                Preview will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
