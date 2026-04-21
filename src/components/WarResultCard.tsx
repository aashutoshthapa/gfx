import { forwardRef } from "react";
import { getPrimaryAttack, type Member, type WarData } from "@/lib/war";

export interface CardOverrides {
  clanName?: string;
  opponentName?: string;
  clanLogo?: string;
  opponentLogo?: string;
  backgroundImage?: string;
}

function Stars({ count }: { count: number }) {
  return (
    <span style={{ color: "##000000", fontSize: 22 }}>
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
          [isLeft ? "left" : "right"]: 184,
          top: 634,
          width: 132,
          height: 132,
          objectFit: "contain",
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.4))",
        }}
      />

      <div
        style={{
          position: "absolute",
          [isLeft ? "left" : "right"]: 44,
          top: 776,
          width: 420,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 42,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            textShadow: "0 3px 10px rgba(0,0,0,0.9)",
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: DISPLAY_FONT,
            fontSize: 34,
            color: "#ffd66b",
            textShadow: "0 2px 8px rgba(0,0,0,0.9)",
          }}
        >
          {stars} STARS
          <span
            style={{
              marginLeft: 10,
              fontSize: 24,
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
              fontSize: 28,
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
              fontSize: 24,
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
              width: 350,
              height: 40,
              transform: "translateX(-50%) translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "#391900",
              padding: "0 12px",
            }}
          >
            <div
              style={{
                minWidth: 0,
                fontFamily: NAME_FONT,
                fontSize: 26,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {bestAttacker.name}
            </div>
            <div
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: 22,
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <Stars count={bestAttack.stars} />
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
