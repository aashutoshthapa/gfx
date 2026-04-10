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
    <span style={{ color: "#FFD700", fontSize: 10 }}>
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

    // Template is 740x700. We render at that size and overlay text.
    const W = 740;
    const H = 700;

    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* Background template image */}
        <img
          src={bgImage}
          alt=""
          style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }}
        />

        {/* Clan logo overlay — positioned over the left logo area */}
        <img
          src={clanLogo}
          alt={clanName}
          style={{
            position: "absolute",
            left: 100,
            top: 195,
            width: 70,
            height: 70,
            objectFit: "contain",
          }}
        />

        {/* Clan name */}
        <div style={{
          position: "absolute",
          left: 30,
          top: 275,
          width: 210,
          textAlign: "center",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 16,
          letterSpacing: 1,
          color: "#fff",
          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
        }}>
          {clanName}
        </div>

        {/* Clan stars */}
        <div style={{
          position: "absolute",
          left: 30,
          top: 295,
          width: 210,
          textAlign: "center",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22,
          color: "#FFD700",
          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
        }}>
          ⭐ {clan.stars} <span style={{ fontSize: 12, color: "#ccc" }}>({clan.destructionPercentage}%)</span>
        </div>

        {/* Clan player bars — 5 gray bars area, starts around y=390, each ~30px tall with gap */}
        {clanSorted.slice(0, 5).map((m, i) => {
          const atk = m.attacks?.[0];
          return (
            <div key={m.tag} style={{
              position: "absolute",
              left: 22,
              top: 385 + i * 38,
              width: 220,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              fontSize: 11,
              fontWeight: 700,
              textShadow: "0 1px 4px rgba(0,0,0,0.9)",
            }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{m.name}</span>
              <span style={{ fontSize: 10, color: "#FFD700", whiteSpace: "nowrap" }}>
                {atk ? <><Stars count={atk.stars} /> {atk.destructionPercentage}%</> : "—"}
              </span>
            </div>
          );
        })}

        {/* Opponent logo overlay */}
        <img
          src={opponentLogo}
          alt={opponentName}
          style={{
            position: "absolute",
            right: 100,
            top: 195,
            width: 70,
            height: 70,
            objectFit: "contain",
          }}
        />

        {/* Opponent name */}
        <div style={{
          position: "absolute",
          right: 30,
          top: 275,
          width: 210,
          textAlign: "center",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 16,
          letterSpacing: 1,
          color: "#fff",
          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
        }}>
          {opponentName}
        </div>

        {/* Opponent stars */}
        <div style={{
          position: "absolute",
          right: 30,
          top: 295,
          width: 210,
          textAlign: "center",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22,
          color: "#FFD700",
          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
        }}>
          ⭐ {opponent.stars} <span style={{ fontSize: 12, color: "#ccc" }}>({opponent.destructionPercentage}%)</span>
        </div>

        {/* Opponent player bars */}
        {opponentSorted.slice(0, 5).map((m, i) => {
          const atk = m.attacks?.[0];
          return (
            <div key={m.tag} style={{
              position: "absolute",
              right: 22,
              top: 385 + i * 38,
              width: 220,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              fontSize: 11,
              fontWeight: 700,
              textShadow: "0 1px 4px rgba(0,0,0,0.9)",
              direction: "rtl",
            }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130, direction: "ltr" }}>{m.name}</span>
              <span style={{ fontSize: 10, color: "#FFD700", whiteSpace: "nowrap", direction: "ltr" }}>
                {atk ? <><Stars count={atk.stars} /> {atk.destructionPercentage}%</> : "—"}
              </span>
            </div>
          );
        })}

        {/* Best Attacker name — center bottom area */}
        {bestAttacker && bestAttacker.attacks?.[0] && (
          <div style={{
            position: "absolute",
            left: "50%",
            bottom: 30,
            transform: "translateX(-50%)",
            textAlign: "center",
            textShadow: "0 2px 10px rgba(0,0,0,0.95)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{bestAttacker.name}</div>
            <div style={{ fontSize: 11, color: "#FFD700" }}>
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
