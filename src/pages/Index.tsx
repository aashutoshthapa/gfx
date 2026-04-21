import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import WarResultCard, { type CardOverrides } from "@/components/WarResultCard";
import { parseWarData, type WarData } from "@/lib/war";

const DEFAULT_TEMPLATE_IMAGE = "/images/hi.png";
const EXPORT_IMAGE_PLACEHOLDER = (() => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4b5563" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="28" fill="url(#g)" />
      <circle cx="80" cy="64" r="28" fill="#f3f4f6" fill-opacity="0.16" />
      <path d="M48 126c7-21 20-31 32-31s25 10 32 31" fill="none" stroke="#f3f4f6" stroke-opacity="0.72" stroke-width="12" stroke-linecap="round" />
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
})();

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

async function imageUrlToDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  try {
    // Correctly detect local vs remote URLs
    const isAbsolute = /^https?:\/\//i.test(url);
    const isLocal = !isAbsolute || url.startsWith(window.location.origin) || url.startsWith("/");

    if (isLocal) {
      // For local assets, fetch directly
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} for local asset`);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read local image"));
        reader.readAsDataURL(blob);
      });
    }

    // Use AllOrigins 'raw' for remote images to bypass CORS and get actual binary data
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Proxy returned HTTP ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read remote image blob"));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`Inlining failed for ${url}, falling back to remote URL:`, err);
    return url; 
  }
}

async function waitForCardAssets(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve, reject) => {
          if (image.complete) {
            resolve();
            return;
          }

          const onLoad = () => {
            image.removeEventListener("load", onLoad);
            image.removeEventListener("error", onError);
            resolve();
          };
          const onError = () => {
            image.removeEventListener("load", onLoad);
            image.removeEventListener("error", onError);
            reject(new Error(`Failed to load image: ${image.src}`));
          };

          image.addEventListener("load", onLoad);
          image.addEventListener("error", onError);
        }),
    ),
  );

  if ("fonts" in document) {
    await document.fonts.ready;
  }

  await new Promise((resolve) => window.setTimeout(resolve, 150));
}

const Index = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [warData, setWarData] = useState<WarData | null>(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [overrides, setOverrides] = useState<CardOverrides>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pickFile = useFileUpload();

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);

    try {
      await waitForCardAssets(cardRef.current);
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipAutoScale: true,
        backgroundColor: "#000000",
        imagePlaceholder: EXPORT_IMAGE_PLACEHOLDER,
      });
      const link = document.createElement("a");
      link.download = "war-result.png";
      link.href = dataUrl;
      link.click();
      setWarning("");
    } catch (err) {
      console.error("Failed to generate image:", err);
      setError("Download failed. Preview can still show remote badges that PNG export is not allowed to embed.");
    } finally {
      setIsDownloading(false);
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

  const applyResolvedWarData = useCallback(async (parsed: WarData) => {
    // 1. Set the raw data first
    setWarData(parsed);

    // 2. Initialize overrides if empty (preserve existing ones)
    setOverrides((current) => ({
      ...current,
      clanLogo: current.clanLogo || parsed.clan.badgeUrls.medium,
      opponentLogo: current.opponentLogo || parsed.opponent.badgeUrls.medium,
      backgroundImage: current.backgroundImage || DEFAULT_TEMPLATE_IMAGE,
    }));

    const warnings: string[] = [];

    // Helper to resolve while tracking warnings
    const resolveWithWarning = async (label: string, url: string) => {
      const result = await imageUrlToDataUrl(url);
      if (result === url && /^https?:\/\//i.test(url)) {
        warnings.push(`${label} could not be embedded for export`);
      }
      return result;
    };

    // 3. Perform inlining in background
    const [clanLogo, opponentLogo, backgroundImage] = await Promise.all([
      resolveWithWarning("Clan badge", parsed.clan.badgeUrls.medium),
      resolveWithWarning("Opponent badge", parsed.opponent.badgeUrls.medium),
      resolveWithWarning("Template", DEFAULT_TEMPLATE_IMAGE),
    ]);

    // 4. Update with inlined versions, protecting manual uploads
    setOverrides((current) => {
      // Logic: If current logo is already a Data URL AND it doesn't contain "allorigins" 
      // (which is our proxy format), it's likely a manual upload.
      const isClanManual = current.clanLogo?.startsWith("data:") && !current.clanLogo?.includes("allorigins");
      const isOpponentManual = current.opponentLogo?.startsWith("data:") && !current.opponentLogo?.includes("allorigins");

      return {
        ...current,
        clanLogo: isClanManual ? current.clanLogo : (clanLogo || current.clanLogo),
        opponentLogo: isOpponentManual ? current.opponentLogo : (opponentLogo || current.opponentLogo),
        backgroundImage: backgroundImage || current.backgroundImage || DEFAULT_TEMPLATE_IMAGE,
      };
    });

    if (warnings.length > 0) {
      warnings.push("Preview may still show the live badge, but PNG export will use a fallback image if embedding is blocked");
    }

    setWarning(warnings.join(". "));
  }, []);

  const handleGenerateResolved = useCallback(async () => {
    try {
      const parsed = parseWarData(jsonInput);
      await applyResolvedWarData(parsed);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
      setWarning("");
    }
  }, [applyResolvedWarData, jsonInput]);

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
              spellCheck={false}
              className="w-full h-52 bg-card text-foreground border border-border rounded-lg p-4 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            {warning && <p className="text-amber-400 text-sm">{warning}</p>}

            <button
              onClick={handleGenerateResolved}
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
                  disabled={isDownloading}
                  className="w-full px-6 py-3 rounded-lg font-bold text-sm bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                >
                  {isDownloading ? "Preparing PNG..." : "⬇ Download PNG"}
                </button>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="flex-1 overflow-auto min-h-[500px]">
            {warData ? (
              <div className="w-full flex justify-center">
                <div 
                  className="rounded-xl overflow-hidden shadow-2xl border border-border origin-top-left" 
                  style={{ 
                    width: 1670,
                    height: 1580,
                    transform: "scale(0.45)", // Fixed scale that fits most screens
                    marginBottom: -1580 * 0.55, // Negative margin to collapse the space occupied by the scaled-down element
                    marginRight: -1670 * 0.55,
                  }}
                >
                  <WarResultCard ref={cardRef} data={warData} overrides={overrides} />
                </div>
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
