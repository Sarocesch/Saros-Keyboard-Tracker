import { GridKey } from "./GridKey";
import { KEY_UNIT_PX, KEY_GAP_PX } from "../../lib/keymap";
import type { Theme } from "../../context/ThemeContext";

const G = KEY_GAP_PX;
const U = KEY_UNIT_PX;

/**
 * Numpad — CSS grid with tall "+" and "Enter" keys.
 *
 * Layout (5 rows × 4 cols):
 *   NumLk  /      *      -
 *   7      8      9      | + |  ← rowspan 2
 *   4      5      6      | + |
 *   1      2      3      | Ent| ← rowspan 2
 *   | 0 (colspan 2)|  .  | Ent|
 */

interface Props {
  normalized: Map<string, number>;
  counts: Map<string, number>;
  theme: Theme;
}

const KEYS = [
  // row 1
  { r: "NumLock",     l: "Num\nLk",  gridArea: "1 / 1 / 2 / 2" },
  { r: "KpDivide",    l: "/",        gridArea: "1 / 2 / 2 / 3" },
  { r: "KpMultiply",  l: "*",        gridArea: "1 / 3 / 2 / 4" },
  { r: "KpMinus",     l: "–",        gridArea: "1 / 4 / 2 / 5" },
  // row 2
  { r: "Kp7",         l: "7",        gridArea: "2 / 1 / 3 / 2" },
  { r: "Kp8",         l: "8",        gridArea: "2 / 2 / 3 / 3" },
  { r: "Kp9",         l: "9",        gridArea: "2 / 3 / 3 / 4" },
  { r: "KpPlus",      l: "+",        gridArea: "2 / 4 / 4 / 5" }, // rowspan 2
  // row 3
  { r: "Kp4",         l: "4",        gridArea: "3 / 1 / 4 / 2" },
  { r: "Kp5",         l: "5",        gridArea: "3 / 2 / 4 / 3" },
  { r: "Kp6",         l: "6",        gridArea: "3 / 3 / 4 / 4" },
  // row 4
  { r: "Kp1",         l: "1",        gridArea: "4 / 1 / 5 / 2" },
  { r: "Kp2",         l: "2",        gridArea: "4 / 2 / 5 / 3" },
  { r: "Kp3",         l: "3",        gridArea: "4 / 3 / 5 / 4" },
  { r: "KpReturn",    l: "Enter",    gridArea: "4 / 4 / 6 / 5" }, // rowspan 2
  // row 5
  { r: "Kp0",         l: "0",        gridArea: "5 / 1 / 6 / 3" }, // colspan 2
  { r: "KpDecimal",   l: ".",        gridArea: "5 / 3 / 6 / 4" },
];

export function NumpadLayout({ normalized, counts, theme }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(4, ${U}px)`,
        gridTemplateRows: `repeat(5, ${U}px)`,
        gap: `${G}px`,
      }}
    >
      {KEYS.map((k) => (
        <GridKey
          key={k.r}
          label={k.l}

          normalizedValue={normalized.get(k.r) ?? 0}
          count={counts.get(k.r) ?? 0}
          theme={theme}
          style={{ gridArea: k.gridArea }}
        />
      ))}
    </div>
  );
}
