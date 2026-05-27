import { forwardRef } from "react";

export interface MatchScheduleData {
  teamOneName: string;
  teamTwoName: string;
  teamOneLogo?: string;
  teamTwoLogo?: string;
  matchTitle: string;
  date: string;
  time: string;
  timezone: string;
}

const W = 1600;
const H = 998;
const DISPLAY_FONT = "'Bebas Neue', 'Arial Narrow', sans-serif";
const TEAM_FONT = "'Inter', 'Segoe UI', sans-serif";

function fitText(value: string, maxLength: number, maxSize: number, minSize = 28) {
  const over = Math.max(value.length - maxLength, 0);
  return Math.max(maxSize - over * 1.8, minSize);
}

function LogoBox({
  src,
  name,
  side,
}: {
  src?: string;
  name: string;
  side: "left" | "right";
}) {
  const left = side === "left" ? 322 : 1015;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 538,
        width: 272,
        height: 225,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: "86%",
            height: "86%",
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "76%",
            height: "76%",
            border: "4px dashed #d7d7d7",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b5b5b5",
            fontFamily: TEAM_FONT,
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          LOGO
        </div>
      )}
    </div>
  );
}

function TeamName({
  name,
  side,
}: {
  name: string;
  side: "left" | "right";
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: side === "left" ? 252 : 943,
        top: 770,
        width: 405,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#050505",
        fontFamily: TEAM_FONT,
        fontSize: fitText(name, 14, 34, 22),
        fontWeight: 900,
        fontStyle: "italic",
        lineHeight: 1,
        textAlign: "center",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        overflow: "hidden",
        padding: "0 28px",
        boxSizing: "border-box",
      }}
    >
      {name}
    </div>
  );
}

const MatchScheduleCard = forwardRef<HTMLDivElement, { data: MatchScheduleData }>(
  ({ data }, ref) => {
    const title = data.matchTitle.trim();
    const date = data.date.trim();
    const timeLine = [data.time.trim(), data.timezone.trim()].filter(Boolean).join(" ");

    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          aspectRatio: `${W} / ${H}`,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          maxWidth: "none",
          color: "#fff",
          fontFamily: DISPLAY_FONT,
        }}
      >
        <img
          src="/images/match.png"
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

        {title && (
          <div
            style={{
              position: "absolute",
              left: 440,
              top: 62,
              width: 720,
              textAlign: "center",
              color: "#ffd24a",
              WebkitTextStroke: "2px #5b2515",
              textShadow: "0 5px 0 rgba(0,0,0,0.3), 0 10px 18px rgba(0,0,0,0.35)",
              fontFamily: DISPLAY_FONT,
              fontSize: fitText(title, 21, 76, 48),
              lineHeight: 0.95,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {title}
          </div>
        )}

        <LogoBox src={data.teamOneLogo} name={data.teamOneName} side="left" />
        <LogoBox src={data.teamTwoLogo} name={data.teamTwoName} side="right" />
        <TeamName name={data.teamOneName || "TEAM ONE"} side="left" />
        <TeamName name={data.teamTwoName || "TEAM TWO"} side="right" />

        {(date || timeLine) && (
          <div
            style={{
              position: "absolute",
              left: 640,
              top: 750,
              width: 320,
              textAlign: "center",
              color: "#fff",
              fontFamily: TEAM_FONT,
              fontWeight: 900,
              fontStyle: "italic",
              lineHeight: 1.18,
              textShadow: "0 4px 8px rgba(0,0,0,0.65)",
            }}
          >
            {date && <div style={{ fontSize: fitText(date, 16, 27, 21) }}>{date}</div>}
            {timeLine && <div style={{ fontSize: fitText(timeLine, 14, 30, 21) }}>{timeLine}</div>}
          </div>
        )}
      </div>
    );
  },
);

MatchScheduleCard.displayName = "MatchScheduleCard";

export default MatchScheduleCard;
