/**
 * ZenPlanner Excel — shared style tokens.
 * Brand palette mirrors the zen-* Tailwind tokens used in the web app.
 */

import type { Fill, Border, Alignment, Font } from "exceljs";

export const COLORS = {
  zenSage: "FF7C9A82",      // RGB(124, 154, 130)
  zenGold: "FFC9A96E",      // RGB(201, 169, 110)
  zenBlossom: "FFD4837F",   // RGB(212, 131, 127)
  zenIndigo: "FF6B7AA1",    // RGB(107, 122, 161)
  inputYellow: "FFFFF8DC",  // light cornsilk for user-input cells
  headerBg: "FF2E3A2A",     // deep zen background
  headerFg: "FFF5F0E1",     // warm cream text
  kpiBg: "FFF1ECDD",        // soft KPI box fill
  borderGray: "FF9AA0A6",
} as const;

export const HEADER_FILL: Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: COLORS.headerBg },
};

export const HEADER_FONT: Partial<Font> = {
  bold: true,
  color: { argb: COLORS.headerFg },
  size: 12,
};

export const TITLE_FONT: Partial<Font> = {
  bold: true,
  size: 18,
  color: { argb: COLORS.zenIndigo },
};

export const KPI_LABEL_FONT: Partial<Font> = {
  bold: true,
  size: 11,
  color: { argb: COLORS.headerBg },
};

export const KPI_VALUE_FONT: Partial<Font> = {
  bold: true,
  size: 16,
  color: { argb: COLORS.zenIndigo },
};

export const KPI_FILL: Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: COLORS.kpiBg },
};

export const INPUT_FILL: Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: COLORS.inputYellow },
};

export const THIN_BORDER: Partial<Border> = {
  style: "thin",
  color: { argb: COLORS.borderGray },
};

export const ALL_BORDERS = {
  top: THIN_BORDER,
  left: THIN_BORDER,
  bottom: THIN_BORDER,
  right: THIN_BORDER,
};

export const CENTER: Partial<Alignment> = {
  horizontal: "center",
  vertical: "middle",
  wrapText: true,
};

export const LEFT: Partial<Alignment> = {
  horizontal: "left",
  vertical: "middle",
  wrapText: true,
};

export const FORMATS = {
  date: "yyyy-mm-dd",
  percent: "0%",
  number: "#,##0",
  currency: '"฿"#,##0.00',
} as const;
