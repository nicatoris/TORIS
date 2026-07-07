import React from "react";
import Svg, { Path, Circle, Line, Polyline } from "react-native-svg";

export type IconName =
  | "plus"
  | "shield"
  | "chevronRight"
  | "chevronLeft"
  | "close"
  | "history"
  | "trophy"
  | "flame"
  | "trash"
  | "bell"
  | "bellOff"
  | "check"
  | "leaf"
  | "flask"
  | "minus"
  | "calendar"
  | "sparkle";

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * A tiny hand-tuned line-icon set drawn in SVG with rounded joins — used
 * everywhere the UI would otherwise reach for an emoji, so the chrome reads
 * as one crafted system rather than a pile of platform glyphs.
 */
export function Icon({ name, size = 22, color = "#F5F5F7", strokeWidth = 1.8 }: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "plus" && (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      )}
      {name === "minus" && <Line x1="5" y1="12" x2="19" y2="12" {...common} />}
      {name === "close" && (
        <>
          <Line x1="6" y1="6" x2="18" y2="18" {...common} />
          <Line x1="18" y1="6" x2="6" y2="18" {...common} />
        </>
      )}
      {name === "check" && <Polyline points="4,12.5 9.5,18 20,6" {...common} />}
      {name === "chevronRight" && <Polyline points="9,5 16,12 9,19" {...common} />}
      {name === "chevronLeft" && <Polyline points="15,5 8,12 15,19" {...common} />}
      {name === "shield" && (
        <Path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" {...common} />
      )}
      {name === "history" && (
        <>
          <Path d="M3.5 12a8.5 8.5 0 108.5-8.5c-3 0-5.6 1.6-7 4" {...common} />
          <Polyline points="4,4 4,8 8,8" {...common} />
          <Polyline points="12,7.5 12,12 15.5,14" {...common} />
        </>
      )}
      {name === "trophy" && (
        <>
          <Path d="M7 4h10v4a5 5 0 01-10 0V4z" {...common} />
          <Path d="M7 5H4.5a2.5 2.5 0 002.5 3" {...common} />
          <Path d="M17 5h2.5a2.5 2.5 0 01-2.5 3" {...common} />
          <Line x1="12" y1="13" x2="12" y2="17" {...common} />
          <Path d="M8.5 20h7M9.5 20c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5" {...common} />
        </>
      )}
      {name === "flame" && (
        <Path
          d="M12 3c1 3-1.5 4-1.5 6.5A2.2 2.2 0 0012 12c1.2 0 2-1 2-2 1.4 1 2.5 2.7 2.5 4.8A6.5 6.5 0 0112 21a6.2 6.2 0 01-6-6.3c0-3.6 2.6-5.7 4-7.2 1.3-1.4 2-2.8 2-4.5z"
          {...common}
        />
      )}
      {name === "trash" && (
        <>
          <Polyline points="4,7 20,7" {...common} />
          <Path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" {...common} />
          <Path d="M9.5 7V5a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0114.5 5v2" {...common} />
        </>
      )}
      {name === "bell" && (
        <>
          <Path d="M6.5 10a5.5 5.5 0 0111 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" {...common} />
          <Path d="M10 19a2 2 0 004 0" {...common} />
        </>
      )}
      {name === "bellOff" && (
        <>
          <Path d="M8 8a4 4 0 015.5-1.8M17.5 10.2c0 3.8 1.5 5.3 1.5 5.3H8" {...common} />
          <Path d="M10 19a2 2 0 004 0" {...common} />
          <Line x1="4" y1="4" x2="20" y2="20" {...common} />
        </>
      )}
      {name === "leaf" && (
        <>
          <Path d="M20 4C10 4 5 9 5 16c0 2 .8 3.4.8 3.4S12 19 16 15s4-11 4-11z" {...common} />
          <Path d="M5 19c3-5 6-8 11-11" {...common} />
        </>
      )}
      {name === "flask" && (
        <>
          <Path d="M9 3h6M10 3v6l-4.5 8A2 2 0 007.3 20h9.4a2 2 0 001.8-3L14 9V3" {...common} />
          <Line x1="8" y1="15" x2="16" y2="15" {...common} />
        </>
      )}
      {name === "calendar" && (
        <>
          <Path d="M4.5 6.5a2 2 0 012-2h11a2 2 0 012 2v11a2 2 0 01-2 2h-11a2 2 0 01-2-2z" {...common} />
          <Line x1="4.5" y1="9.5" x2="19.5" y2="9.5" {...common} />
          <Line x1="8.5" y1="3" x2="8.5" y2="6" {...common} />
          <Line x1="15.5" y1="3" x2="15.5" y2="6" {...common} />
        </>
      )}
      {name === "sparkle" && (
        <Path
          d="M12 3.5c.7 3.6 1.9 4.8 5.5 5.5-3.6.7-4.8 1.9-5.5 5.5-.7-3.6-1.9-4.8-5.5-5.5 3.6-.7 4.8-1.9 5.5-5.5z"
          {...common}
        />
      )}
    </Svg>
  );
}
