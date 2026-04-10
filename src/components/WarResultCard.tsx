import { forwardRef } from "react";

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

function Stars({ count }: { count: number }) {
  return (
    <span style={{ color: "#FFD700", fontSize: 20 }}>
      {"★".repeat(count)}{"☆".repeat(3 - count)}
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

// Bar positions from template analysis (1670x1580)
const LEFT_BARS = [
  { y: 977, h: 58, x: 148, w: 686 },
  { y: 1064, h: 57, x: 148, w: 686 },
  { y: 1150, h: 57, x: 148, w: 652 },
  { y: 1218, h: 76, x: 148, w: 686 },
  { y: 1323, h: 57, x: 148, w: 537 },
];

const RIGHT_BARS = [
  { y: 978, h: 57, x: 835, w: 681 },
  { y: 1064, h: 57, x: 835, w: 684 },
  { y: 1150, h: 57, x: 986, w: 537 },
  { y: 1219, h: 75, x: 835, w: 691 },
  { y: 1323, h: 57, x: 993, w: 537 },
];

const W = 1670;
const H = 1580;

const WarResultCard = forwardRef<HTMLDivElement, { data: WarData; overrides?: CardOverrides }>(
  ({ data, overrides = {} }, ref) => {
    const { clan, opponent } = data;
    const clanName = overrides.clanName || clan.name;
    const opponentName = overrides.opponentName || opponent.name;
    const clanLogo = overrides.clanLogo || clan.badgeUrls.medium;
    const opponentLogo = overrides.opponentLogo || opponent.badgeUrls.medium;
    const bgImage = overrides.backgroundImage || "/images/war-template.png";

    const clanSorted = [...clan.members].sort((a, b) => a.mapPosition - b.mapPosition);
    const opponentSorted = [...opponent.members].sort((a, b) => a.mapPosition - b.mapPosition);

    const allMembers = [...clan.members, ...opponent.members];
    const bestAttacker = getBestAttacker(allMembers);

    const barText = (m: Member, bar: typeof LEFT_BARS[0], align: "left" | "right") => {
      const atk = m.attacks?.[0];
      return (
        <div key={m.tag} style={{
          position: "absolute",
          left: bar.x,
          top: bar.y,
          width: bar.w,
          height: bar.h,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: 1,
          color: "#1a0a00",
          direction: align === "right" ? "rtl" : "ltr",
        }}>
          <span style={{
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: bar.w * 0.55, direction: "ltr",
          }}>{m.name}</span>
          <span style={{ fontSize: 18, whiteSpace: "nowrap", direction: "ltr", display: "flex", alignItems: "center", gap: 6 }}>
            {atk ? <><Stars count={atk.stars} /> {atk.destructionPercentage}%</> : "—"}
          </span>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Bebas Neue', sans-serif",
          color: "#fff",
        }}
      >
        <img
          src={bgImage}
          alt=""
          crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }}
        />

        {/* Clan logo */}
        <img
          src={clanLogo}
          alt={clanName}
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            left: 180,
            top: 620,
            width: 140,
            height: 140,
            objectFit: "contain",
          }}
        />

        {/* Clan name + stars */}
        <div style={{
          position: "absolute",
          left: 50,
          top: 780,
          width: 440,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 2, textShadow: "0 3px 10px rgba(0,0,0,0.9)" }}>
            {clanName}
          </div>
          <div style={{ fontSize: 30, color: "#FFD700", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
            ⭐ {clan.stars} <span style={{ fontSize: 20, color: "#ddd" }}>({clan.destructionPercentage}%)</span>
          </div>
        </div>

        {/* Opponent logo */}
        <img
          src={opponentLogo}
          alt={opponentName}
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            right: 180,
            top: 620,
            width: 140,
            height: 140,
            objectFit: "contain",
          }}
        />

        {/* Opponent name + stars */}
        <div style={{
          position: "absolute",
          right: 50,
          top: 780,
          width: 440,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 2, textShadow: "0 3px 10px rgba(0,0,0,0.9)" }}>
            {opponentName}
          </div>
          <div style={{ fontSize: 30, color: "#FFD700", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
            ⭐ {opponent.stars} <span style={{ fontSize: 20, color: "#ddd" }}>({opponent.destructionPercentage}%)</span>
          </div>
        </div>

        {/* Clan player bars */}
        {clanSorted.slice(0, 5).map((m, i) => barText(m, LEFT_BARS[i], "left"))}

        {/* Opponent player bars */}
        {opponentSorted.slice(0, 5).map((m, i) => barText(m, RIGHT_BARS[i], "right"))}

        {/* Best Attacker */}
        {bestAttacker && bestAttacker.attacks?.[0] && (
          <div style={{
            position: "absolute",
            left: "50%",
            top: 1440,
            transform: "translateX(-50%)",
            textAlign: "center",
            textShadow: "0 3px 12px rgba(0,0,0,0.95)",
          }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{bestAttacker.name}</div>
            <div style={{ fontSize: 22, color: "#FFD700", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Stars count={bestAttacker.attacks[0].stars} /> {bestAttacker.attacks[0].destructionPercentage}%
            </div>
          </div>
        )}
      </div>
    );
  }
);

WarResultCard.displayName = "WarResultCard";
export default WarResultCard;
