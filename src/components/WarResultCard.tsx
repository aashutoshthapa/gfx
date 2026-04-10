import { forwardRef, useState } from "react";

interface Attack {
  stars: number;
  destructionPercentage: number;
}

interface Member {
  tag: string;
  name: string;
  townhallLevel: number;
  mapPosition: number;
  attacks?: Attack[];
}

interface ClanData {
  name: string;
  badgeUrls: { medium: string };
  stars: number;
  destructionPercentage: number;
  members: Member[];
}

export interface WarData {
  clan: ClanData;
  opponent: ClanData;
}

export interface CardOverrides {
  clanName?: string;
  opponentName?: string;
  clanLogo?: string;
  opponentLogo?: string;
  backgroundImage?: string;
}

function StarIcons({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < count ? "#FFD700" : "#555" }}>★</span>
      ))}
    </span>
  );
}

function getBestAttacker(members: Member[]): Member | null {
  let best: Member | null = null;
  let bestStars = -1;
  let bestPct = -1;
  for (const m of members) {
    const atk = m.attacks?.[0];
    if (atk && (atk.stars > bestStars || (atk.stars === bestStars && atk.destructionPercentage > bestPct))) {
      best = m;
      bestStars = atk.stars;
      bestPct = atk.destructionPercentage;
    }
  }
  return best;
}

const WarResultCard = forwardRef<HTMLDivElement, { data: WarData; overrides?: CardOverrides }>(
  ({ data, overrides = {} }, ref) => {
    const { clan, opponent } = data;
    const clanName = overrides.clanName || clan.name;
    const opponentName = overrides.opponentName || opponent.name;
    const clanLogo = overrides.clanLogo || clan.badgeUrls.medium;
    const opponentLogo = overrides.opponentLogo || opponent.badgeUrls.medium;

    const clanWon = clan.stars > opponent.stars ||
      (clan.stars === opponent.stars && clan.destructionPercentage > opponent.destructionPercentage);
    const opponentWon = opponent.stars > clan.stars ||
      (opponent.stars === clan.stars && opponent.destructionPercentage > clan.destructionPercentage);

    const clanSorted = [...clan.members].sort((a, b) => a.mapPosition - b.mapPosition);
    const opponentSorted = [...opponent.members].sort((a, b) => a.mapPosition - b.mapPosition);

    const allMembers = [...clan.members, ...opponent.members];
    const bestAttacker = getBestAttacker(allMembers);

    const bgStyle: React.CSSProperties = overrides.backgroundImage
      ? { backgroundImage: `url(${overrides.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)" };

    return (
      <div
        ref={ref}
        style={{
          width: 800,
          minHeight: 900,
          ...bgStyle,
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dark overlay when background image is set */}
        {overrides.backgroundImage && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 0 }} />
        )}

        {/* Decorative corners */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: "linear-gradient(225deg, #e63946 0%, transparent 60%)", opacity: 0.8, zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 120, height: 120, background: "linear-gradient(45deg, #e63946 0%, transparent 60%)", opacity: 0.8, zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Header */}
          <div style={{ textAlign: "center", padding: "30px 20px 10px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 6, color: "#aaa" }}>RESULT</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, letterSpacing: 8, color: "#FFD700", lineHeight: 1 }}>MATCH</div>
          </div>

          {/* Clan badges + names + scores */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 30, padding: "10px 20px 20px" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <img src={clanLogo} alt={clanName} style={{ width: 80, height: 80, margin: "0 auto", objectFit: "contain" }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, marginTop: 6, color: clanWon ? "#FFD700" : "#ccc" }}>{clanName}</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#FFD700" }}>⭐ {clan.stars}</span>
                <span style={{ fontSize: 13, color: "#aaa" }}>{clan.destructionPercentage}%</span>
              </div>
            </div>

            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#FFD700", textShadow: "0 0 20px rgba(255,215,0,0.5)" }}>VS</div>

            <div style={{ textAlign: "center", flex: 1 }}>
              <img src={opponentLogo} alt={opponentName} style={{ width: 80, height: 80, margin: "0 auto", objectFit: "contain" }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, marginTop: 6, color: opponentWon ? "#FFD700" : "#ccc" }}>{opponentName}</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#FFD700" }}>⭐ {opponent.stars}</span>
                <span style={{ fontSize: 13, color: "#aaa" }}>{opponent.destructionPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Player list */}
          <div style={{ display: "flex", gap: 16, padding: "0 24px", marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              {clanSorted.map((m) => {
                const atk = m.attacks?.[0];
                return (
                  <div key={m.tag} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 6, borderLeft: "3px solid #FFD700" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                      TH{m.townhallLevel} · {atk ? <><StarIcons count={atk.stars} /> {atk.destructionPercentage}%</> : "No attack"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ flex: 1 }}>
              {opponentSorted.map((m) => {
                const atk = m.attacks?.[0];
                return (
                  <div key={m.tag} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 6, borderRight: "3px solid #e63946", textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                      TH{m.townhallLevel} · {atk ? <><StarIcons count={atk.stars} /> {atk.destructionPercentage}%</> : "No attack"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Attacker */}
          {bestAttacker && bestAttacker.attacks?.[0] && (
            <div style={{ textAlign: "center", padding: "24px 20px 30px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#aaa", letterSpacing: 3 }}>BEST</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#FFD700", lineHeight: 1 }}>ATTACKER</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>{bestAttacker.name}</div>
              <div style={{ fontSize: 14, color: "#aaa" }}>
                <StarIcons count={bestAttacker.attacks[0].stars} /> · {bestAttacker.attacks[0].destructionPercentage}%
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

WarResultCard.displayName = "WarResultCard";
export default WarResultCard;
