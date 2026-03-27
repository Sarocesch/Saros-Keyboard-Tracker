export interface KeyDef {
  rdevName: string;
  label: string;
  row: number;
  col: number;
  widthUnits: number;
}

export const KEYBOARD_LAYOUT: KeyDef[] = [
  // Row 0 — Number row
  { rdevName: "Grave",        label: "`",     row: 0, col: 0,  widthUnits: 1 },
  { rdevName: "Num1",         label: "1",     row: 0, col: 1,  widthUnits: 1 },
  { rdevName: "Num2",         label: "2",     row: 0, col: 2,  widthUnits: 1 },
  { rdevName: "Num3",         label: "3",     row: 0, col: 3,  widthUnits: 1 },
  { rdevName: "Num4",         label: "4",     row: 0, col: 4,  widthUnits: 1 },
  { rdevName: "Num5",         label: "5",     row: 0, col: 5,  widthUnits: 1 },
  { rdevName: "Num6",         label: "6",     row: 0, col: 6,  widthUnits: 1 },
  { rdevName: "Num7",         label: "7",     row: 0, col: 7,  widthUnits: 1 },
  { rdevName: "Num8",         label: "8",     row: 0, col: 8,  widthUnits: 1 },
  { rdevName: "Num9",         label: "9",     row: 0, col: 9,  widthUnits: 1 },
  { rdevName: "Num0",         label: "0",     row: 0, col: 10, widthUnits: 1 },
  { rdevName: "Minus",        label: "-",     row: 0, col: 11, widthUnits: 1 },
  { rdevName: "Equal",        label: "=",     row: 0, col: 12, widthUnits: 1 },
  { rdevName: "BackSpace",    label: "⌫",     row: 0, col: 13, widthUnits: 2 },

  // Row 1 — QWERTY
  { rdevName: "Tab",          label: "Tab",   row: 1, col: 0,  widthUnits: 1.5 },
  { rdevName: "KeyQ",         label: "Q",     row: 1, col: 1,  widthUnits: 1 },
  { rdevName: "KeyW",         label: "W",     row: 1, col: 2,  widthUnits: 1 },
  { rdevName: "KeyE",         label: "E",     row: 1, col: 3,  widthUnits: 1 },
  { rdevName: "KeyR",         label: "R",     row: 1, col: 4,  widthUnits: 1 },
  { rdevName: "KeyT",         label: "T",     row: 1, col: 5,  widthUnits: 1 },
  { rdevName: "KeyY",         label: "Y",     row: 1, col: 6,  widthUnits: 1 },
  { rdevName: "KeyU",         label: "U",     row: 1, col: 7,  widthUnits: 1 },
  { rdevName: "KeyI",         label: "I",     row: 1, col: 8,  widthUnits: 1 },
  { rdevName: "KeyO",         label: "O",     row: 1, col: 9,  widthUnits: 1 },
  { rdevName: "KeyP",         label: "P",     row: 1, col: 10, widthUnits: 1 },
  { rdevName: "LeftBracket",  label: "[",     row: 1, col: 11, widthUnits: 1 },
  { rdevName: "RightBracket", label: "]",     row: 1, col: 12, widthUnits: 1 },
  { rdevName: "BackSlash",    label: "\\",    row: 1, col: 13, widthUnits: 1.5 },

  // Row 2 — Home row
  { rdevName: "CapsLock",     label: "Caps",  row: 2, col: 0,  widthUnits: 1.75 },
  { rdevName: "KeyA",         label: "A",     row: 2, col: 1,  widthUnits: 1 },
  { rdevName: "KeyS",         label: "S",     row: 2, col: 2,  widthUnits: 1 },
  { rdevName: "KeyD",         label: "D",     row: 2, col: 3,  widthUnits: 1 },
  { rdevName: "KeyF",         label: "F",     row: 2, col: 4,  widthUnits: 1 },
  { rdevName: "KeyG",         label: "G",     row: 2, col: 5,  widthUnits: 1 },
  { rdevName: "KeyH",         label: "H",     row: 2, col: 6,  widthUnits: 1 },
  { rdevName: "KeyJ",         label: "J",     row: 2, col: 7,  widthUnits: 1 },
  { rdevName: "KeyK",         label: "K",     row: 2, col: 8,  widthUnits: 1 },
  { rdevName: "KeyL",         label: "L",     row: 2, col: 9,  widthUnits: 1 },
  { rdevName: "SemiColon",    label: ";",     row: 2, col: 10, widthUnits: 1 },
  { rdevName: "Quote",        label: "'",     row: 2, col: 11, widthUnits: 1 },
  { rdevName: "Return",       label: "Enter", row: 2, col: 12, widthUnits: 2.25 },

  // Row 3 — Shift row
  { rdevName: "ShiftLeft",    label: "Shift", row: 3, col: 0,  widthUnits: 2.25 },
  { rdevName: "KeyZ",         label: "Z",     row: 3, col: 1,  widthUnits: 1 },
  { rdevName: "KeyX",         label: "X",     row: 3, col: 2,  widthUnits: 1 },
  { rdevName: "KeyC",         label: "C",     row: 3, col: 3,  widthUnits: 1 },
  { rdevName: "KeyV",         label: "V",     row: 3, col: 4,  widthUnits: 1 },
  { rdevName: "KeyB",         label: "B",     row: 3, col: 5,  widthUnits: 1 },
  { rdevName: "KeyN",         label: "N",     row: 3, col: 6,  widthUnits: 1 },
  { rdevName: "KeyM",         label: "M",     row: 3, col: 7,  widthUnits: 1 },
  { rdevName: "Comma",        label: ",",     row: 3, col: 8,  widthUnits: 1 },
  { rdevName: "Dot",          label: ".",     row: 3, col: 9,  widthUnits: 1 },
  { rdevName: "Slash",        label: "/",     row: 3, col: 10, widthUnits: 1 },
  { rdevName: "ShiftRight",   label: "Shift", row: 3, col: 11, widthUnits: 2.75 },

  // Row 4 — Bottom row
  { rdevName: "ControlLeft",  label: "Ctrl",  row: 4, col: 0,  widthUnits: 1.25 },
  { rdevName: "MetaLeft",     label: "Win",   row: 4, col: 1,  widthUnits: 1.25 },
  { rdevName: "Alt",          label: "Alt",   row: 4, col: 2,  widthUnits: 1.25 },
  { rdevName: "Space",        label: " ",     row: 4, col: 3,  widthUnits: 6.25 },
  { rdevName: "AltGr",        label: "AltGr", row: 4, col: 4,  widthUnits: 1.25 },
  { rdevName: "MetaRight",    label: "Win",   row: 4, col: 5,  widthUnits: 1.25 },
  { rdevName: "ControlRight", label: "Ctrl",  row: 4, col: 6,  widthUnits: 1.25 },
];

export const KEY_UNIT_PX = 44;
export const KEY_GAP_PX = 3;
