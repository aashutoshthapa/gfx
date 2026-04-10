import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import WarResultCard, { type WarData, type CardOverrides } from "@/components/WarResultCard";

function useFileUpload() {
  const pick = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }, []);
  return pick;
}

const Index = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [warData, setWarData] = useState<WarData | null>(null);
  const [error, setError] = useState("");
  const [overrides, setOverrides] = useState<CardOverrides>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const pickFile = useFileUpload();

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.clan || !parsed.opponent) {
        setError("JSON must contain 'clan' and 'opponent' fields");
        return;
      }
      setWarData(parsed);
      setOverrides({});
      setError("");
    } catch {
      setError("Invalid JSON format");
    }
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      // Run toPng twice — first call warms up image loading, second produces clean output
      await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true, skipAutoScale: true });
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true, skipAutoScale: true });
      const link = document.createElement("a");
      link.download = "war-result.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  }, []);

  const uploadClanLogo = async () => {
    const data = await pickFile();
    if (data) setOverrides((o) => ({ ...o, clanLogo: data }));
  };
  const uploadOpponentLogo = async () => {
    const data = await pickFile();
    if (data) setOverrides((o) => ({ ...o, opponentLogo: data }));
  };
  const uploadBackground = async () => {
    const data = await pickFile();
    if (data) setOverrides((o) => ({ ...o, backgroundImage: data }));
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10" style={{ fontFamily: "var(--font-body)" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-foreground text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", letterSpacing: 4 }}>
          COC WAR RESULT GENERATOR
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Paste your Clash of Clans war API JSON, customize logos &amp; names, then download as PNG.
        </p>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left: Input + Controls */}
          <div className="w-full xl:w-[380px] shrink-0 space-y-4">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your COC war JSON here..."
              className="w-full h-52 bg-card text-foreground border border-border rounded-lg p-4 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              onClick={handleGenerate}
              className="w-full px-6 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Generate
            </button>

            {warData && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Customize</div>

                {/* Clan name */}
                <div>
                  <label className="text-xs text-muted-foreground">Clan Name</label>
                  <input
                    type="text"
                    placeholder={warData.clan.name}
                    value={overrides.clanName || ""}
                    onChange={(e) => setOverrides((o) => ({ ...o, clanName: e.target.value }))}
                    className="w-full mt-1 bg-card text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Opponent name */}
                <div>
                  <label className="text-xs text-muted-foreground">Opponent Name</label>
                  <input
                    type="text"
                    placeholder={warData.opponent.name}
                    value={overrides.opponentName || ""}
                    onChange={(e) => setOverrides((o) => ({ ...o, opponentName: e.target.value }))}
                    className="w-full mt-1 bg-card text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Upload buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={uploadClanLogo} className="px-3 py-2 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:opacity-80 transition-opacity">
                    Upload Clan Logo
                  </button>
                  <button onClick={uploadOpponentLogo} className="px-3 py-2 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:opacity-80 transition-opacity">
                    Upload Opponent Logo
                  </button>
                </div>
                <button onClick={uploadBackground} className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:opacity-80 transition-opacity">
                  Upload Background Image
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="w-full px-6 py-3 rounded-lg font-bold text-sm bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                >
                  ⬇ Download PNG
                </button>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="flex-1 overflow-x-auto">
            {warData ? (
              <div className="rounded-xl overflow-hidden shadow-2xl inline-block" style={{ width: 740 }}>
                <WarResultCard ref={cardRef} data={warData} overrides={overrides} />
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
