import { GridKey } from "./GridKey";
import { KEY_UNIT_PX, KEY_GAP_PX } from "../../lib/keymap";
import type { Theme } from "../../context/ThemeContext";

const G = KEY_GAP_PX;
const U = KEY_UNIT_PX;

/**
 * Navigation cluster — rendered with CSS grid so empty cells produce
 * correct spacing without placeholder elements.
 *
 * Layout (6 rows × 3 cols):
 *   PrtSc  ScrLk  Pause
 *   Ins    Home   PgUp
 *   Del    End    PgDn
 *   (gap)
 *          ↑
 *   ←      ↓      →
 */

interface Props {
  normalized: Map<string, number>;
  counts: Map<string, number>;
  theme: Theme;
}

const KEYS = [
  // row 1
  { r: "PrintScreen", l: "PrtSc",  gridArea: "1 / 1 / 2 / 2" },
  { r: "ScrollLock",  l: "ScrLk",  gridArea: "1 / 2 / 2 / 3" },
  { r: "Pause",       l: "Pause",  gridArea: "1 / 3 / 2 / 4" },
  // row 2
  { r: "Insert",      l: "Ins",    gridArea: "2 / 1 / 3 / 2" },
  { r: "Home",        l: "Home",   gridArea: "2 / 2 / 3 / 3" },
  { r: "PageUp",      l: "PgUp",   gridArea: "2 / 3 / 3 / 4" },
  // row 3
  { r: "Delete",      l: "Del",    gridArea: "3 / 1 / 4 / 2" },
  { r: "End",         l: "End",    gridArea: "3 / 2 / 4 / 3" },
  { r: "PageDown",    l: "PgDn",   gridArea: "3 / 3 / 4 / 4" },
  // row 5 — arrow keys (row 4 is gap)
  { r: "UpArrow",     l: "↑",      gridArea: "5 / 2 / 6 / 3" },
  // row 6
  { r: "LeftArrow",   l: "←",      gridArea: "6 / 1 / 7 / 2" },
  { r: "DownArrow",   l: "↓",      gridArea: "6 / 2 / 7 / 3" },
  { r: "RightArrow",  l: "→",      gridArea: "6 / 3 / 7 / 4" },
];

export function NavCluster({ normalized, counts, theme }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(3, ${U}px)`,
        gridTemplateRows: `${U}px ${U}px ${U}px ${G * 3}px ${U}px ${U}px`,
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
