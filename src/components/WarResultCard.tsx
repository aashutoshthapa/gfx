import { forwardRef } from "react";
import { getPrimaryAttack, type Member, type WarData } from "@/lib/war";

export interface CardOverrides {
  clanName?: string;
  opponentName?: string;
  clanLogo?: string;
  opponentLogo?: string;
  backgroundImage?: string;
}

function Stars({ count, size = 30 }: { count: number; size?: number }) {
  return (
    <span style={{ color: "#000000", fontSize: size, lineHeight: 1 }}>
      {"★".repeat(count)}{"☆".repeat(3 - count)}
    </span>
  );
}

function formatPercent(value: number): string {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function getBestAttacker(members: Member[]): Member | null {
  let best: Member | null = null;
  let bestStars = -1;
  let bestPct = -1;

  for (const m of members) {
    const atk = getPrimaryAttack(m.attacks);

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
  { y: 889, h: 58, x: 110, w: 640 },
  { y: 976, h: 57, x: 110, w: 640 },
  { y: 1062, h: 57, x: 110, w: 652 },
  { y: 1130, h: 76, x: 110, w: 580 }, // Shortened for center box
  { y: 1235, h: 57, x: 110, w: 537 },
];

const RIGHT_BARS = [
  { y: 890, h: 57, x: 1020, w: 500 },
  { y: 976, h: 57, x: 1020, w: 500 },
  { y: 1062, h: 57, x: 1020, w: 500 },
  { y: 1131, h: 75, x: 1020, w: 500 },
  { y: 1235, h: 57, x: 1020, w: 500 },
];

const W = 1670;
const H = 1580;
const NAME_FONT = "'Inter', 'Segoe UI', 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
const TEAM_NAME_FONT = "'Bangers', 'Bebas Neue', 'Arial Narrow', sans-serif";
const DISPLAY_FONT = "'Bebas Neue', 'Arial Narrow', sans-serif";

function TeamHeader({
  align,
  logo,
  name,
  stars,
  destructionPercentage,
}: {
  align: "left" | "right";
  logo: string;
  name: string;
  stars: number;
  destructionPercentage: number;
}) {
  const isLeft = align === "left";

  return (
    <>
      <img
        src={logo}
        alt={name}
        style={{
          position: "absolute",
          [isLeft ? "left" : "right"]: isLeft ? 158 : 275,
          top: 552,
          width: 184,
          height: 184,
          objectFit: "contain",
          filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.48))",
        }}
      />

      <div
        style={{
          position: "absolute",
          [isLeft ? "left" : "right"]: isLeft ? 44 : 161,
          top: 738,
          width: 420,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: TEAM_NAME_FONT,
            fontSize: 46,
            lineHeight: 1,
            fontWeight: 400,
            letterSpacing: 0,
            textShadow: "0 4px 0 rgba(0,0,0,0.55), 0 8px 14px rgba(0,0,0,0.9)",
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: DISPLAY_FONT,
            fontSize: 44,
            color: "#ffd66b",
            textShadow: "0 2px 8px rgba(0,0,0,0.9)",
          }}
        >
          {stars} STARS
          <span
            style={{
              marginLeft: 10,
              fontSize: 32,
              color: "#f7f1d6",
            }}
          >
            {formatPercent(destructionPercentage)}
          </span>
        </div>
      </div>
    </>
  );
}

function MemberBar({
  member,
  bar,
  side,
}: {
  member: Member;
  bar: (typeof LEFT_BARS)[number];
  side: "left" | "right";
}) {
  const attack = getPrimaryAttack(member.attacks);
  const isLeft = side === "left";
  const rowInset = 28;
  const scoreWidth = 140;
  const contentWidth = Math.max(bar.w - rowInset * 2, 120);
  const nameWidth = Math.max(contentWidth - scoreWidth - 12, 120);

  return (
    <div
      key={member.tag}
      style={{
        position: "absolute",
        left: bar.x,
        top: bar.y,
        width: bar.w,
        height: bar.h,
        color: "#391900",
      }}
    >
        <div
          style={{
            position: "absolute",
            [isLeft ? "left" : "left"]: isLeft ? 0 : 118, // Moved right names 1cm more right
            top: "50%",
            transform: "translateY(-50%)",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 20, // Approx 4-5 spaces
          }}
        >
          <div
            style={{
              minWidth: 0,
              fontFamily: NAME_FONT,
              fontSize: 19,
              fontWeight: 800,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              textAlign: "left",
            }}
          >
            {member.name}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 8,
              fontFamily: DISPLAY_FONT,
              fontSize: 30,
              fontWeight: 800,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {attack ? (
              <>
                <Stars count={attack.stars} />
                <span>{formatPercent(attack.destructionPercentage)}</span>
              </>
            ) : (
              <span>{"NO ATTACK"}</span>
            )}
          </div>
        </div>
    </div>
  );
}

const WarResultCard = forwardRef<HTMLDivElement, { data: WarData; overrides?: CardOverrides }>(
  ({ data, overrides = {} }, ref) => {
    const { clan, opponent } = data;
    const clanName = overrides.clanName || clan.name;
    const opponentName = overrides.opponentName || opponent.name;
    const clanLogo = overrides.clanLogo || clan.badgeUrls.medium;
    const opponentLogo = overrides.opponentLogo || opponent.badgeUrls.medium;
    const bgImage = overrides.backgroundImage || "/images/hi.png";

    const clanSorted = [...clan.members].sort((a, b) => a.mapPosition - b.mapPosition);
    const opponentSorted = [...opponent.members].sort((a, b) => a.mapPosition - b.mapPosition);

    const allMembers = [...clan.members, ...opponent.members];
    const bestAttacker = getBestAttacker(allMembers);
    const bestAttack = bestAttacker ? getPrimaryAttack(bestAttacker.attacks) : null;

    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          aspectRatio: `${W} / ${H}`,
          position: "relative",
          overflow: "hidden",
          fontFamily: DISPLAY_FONT,
          color: "#fff",
          flexShrink: 0,
          maxWidth: "none",
        }}
      >
        <img
          src={bgImage}
          alt=""
          style={{ 
            position: "absolute", 
            inset: 0, 
            width: W, 
            height: H, 
            objectFit: "fill",
            maxWidth: "none",
          }}
        />

        <TeamHeader
          align="left"
          logo={clanLogo}
          name={clanName}
          stars={clan.stars}
          destructionPercentage={clan.destructionPercentage}
        />
        <TeamHeader
          align="right"
          logo={opponentLogo}
          name={opponentName}
          stars={opponent.stars}
          destructionPercentage={opponent.destructionPercentage}
        />

        {/* Clan player bars */}
        {clanSorted.slice(0, 5).map((member, index) => (
          <MemberBar key={member.tag} member={member} bar={LEFT_BARS[index]} side="left" />
        ))}

        {/* Opponent player bars */}
        {opponentSorted.slice(0, 5).map((member, index) => (
          <MemberBar key={member.tag} member={member} bar={RIGHT_BARS[index]} side="right" />
        ))}

        {/* Best Attacker */}
        {bestAttacker && bestAttack && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 1281, // Moved down another 0.5cm for hi.png
              width: 356,
              height: 40,
              transform: "translateX(-50%) translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              color: "#391900",
              padding: "0 18px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                minWidth: 0,
                flex: "1 1 auto",
                fontFamily: NAME_FONT,
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {bestAttacker.name}
            </div>
            <div
              style={{
                flex: "0 0 118px",
                fontFamily: DISPLAY_FONT,
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 5,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              <Stars count={bestAttack.stars} size={24} />
              {formatPercent(bestAttack.destructionPercentage)}
            </div>
          </div>
        )}
      </div>
    );
  }
);

WarResultCard.displayName = "WarResultCard";
export default WarResultCard;
