/**
 * PDF Font Resolution & Dynamic Google Fonts Loader
 *
 * Maps internal PDF font names (e.g. "BCDEEE+Calibri-Bold") to real
 * CSS font-family names and loads matching Google Fonts on demand.
 *
 * Bold detection combines three sources:
 *   1. fontName string heuristics (e.g. "HelveticaNeueLTStd-Bd")
 *   2. pdfjs textContent.styles[fontName].fontWeight
 *   3. CSS @font-face with real bold variant (wght 700)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FontInfo {
  family: string;          // CSS font-family value (e.g. '"Inter", sans-serif')
  weight: "normal" | "bold";
  style: "normal" | "italic";
  googleFamily?: string;   // Google Fonts family name (for loading)
  generic: string;         // fallback generic: serif | sans-serif | monospace
}

export interface FontStyleProps {
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  fontSize: string;       // e.g. "14px"
  lineHeight: string;
}

// ─── PDF font name → web font mapping ────────────────────────────────────────

const FONT_MAP: Record<string, { google?: string; generic: string }> = {
  // Sans-serif
  helvetica:    { google: "Inter",           generic: "sans-serif" },
  arial:        { google: "Inter",           generic: "sans-serif" },
  calibri:      { google: "Carlito",         generic: "sans-serif" },
  verdana:      { google: "Open Sans",       generic: "sans-serif" },
  tahoma:       { google: "Open Sans",       generic: "sans-serif" },
  trebuchet:    { google: "Source Sans 3",   generic: "sans-serif" },
  "gill sans":  { google: "Lato",            generic: "sans-serif" },
  futura:       { google: "Nunito Sans",     generic: "sans-serif" },
  optima:       { google: "Noto Sans",       generic: "sans-serif" },
  segoeui:      { google: "Noto Sans",       generic: "sans-serif" },
  roboto:       { google: "Roboto",          generic: "sans-serif" },
  "open sans":  { google: "Open Sans",       generic: "sans-serif" },
  lato:         { google: "Lato",            generic: "sans-serif" },
  montserrat:   { google: "Montserrat",      generic: "sans-serif" },
  poppins:      { google: "Poppins",         generic: "sans-serif" },
  inter:        { google: "Inter",           generic: "sans-serif" },
  // Serif
  times:        { google: "Tinos",           generic: "serif" },
  "times new roman": { google: "Tinos",      generic: "serif" },
  georgia:      { google: "Gelasio",         generic: "serif" },
  garamond:     { google: "EB Garamond",     generic: "serif" },
  palatino:     { google: "Libre Baskerville", generic: "serif" },
  bookman:      { google: "Bookman Old Style", generic: "serif" },
  cambria:      { google: "Caladea",         generic: "serif" },
  minion:       { google: "Libre Baskerville", generic: "serif" },
  caslon:       { google: "Libre Caslon Text", generic: "serif" },
  baskerville:  { google: "Libre Baskerville", generic: "serif" },
  didot:        { google: "Playfair Display", generic: "serif" },
  bodoni:       { google: "Libre Bodoni",    generic: "serif" },
  // Monospace
  courier:      { google: "Courier Prime",   generic: "monospace" },
  "courier new": { google: "Courier Prime",  generic: "monospace" },
  consolas:     { google: "Source Code Pro",  generic: "monospace" },
  monaco:       { google: "Source Code Pro",  generic: "monospace" },
  "lucida console": { google: "Source Code Pro", generic: "monospace" },
};

// ─── Bold / Italic detection patterns ─────────────────────────────────────────
// Covers standard suffixes AND abbreviated forms used in embedded PDF fonts
// e.g. "ABCXYZ+HelveticaNeueLTStd-Bd", "ArialMT,BoldItalic", "Calibri-BoldItalic"
const BOLD_RE = /bold|heavy|black|semibold|demi(?!-?light)|[-_]bd(?:[,\s_-]|$)|w[578900]+/i;
const ITALIC_RE = /italic|oblique|[-_]it(?:[,\s_-]|$)/i;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function cleanFontName(raw: string): string {
  return raw
    .replace(/^[A-Z]{6}\+/, "")
    .replace(/[-,](bold|italic|oblique|regular|medium|light|semibold|book|roman|condensed|narrow|extended|heavy|black|thin|extra\s*light|bd|it)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detect bold / italic from a raw PDF font name + optional pdfjs family string.
 * Uses expanded regex that covers abbreviated forms like "-Bd", "-It".
 */
function detectWeightStyle(
  rawFontName: string,
  pdfjsFamily?: string,
): { weight: "normal" | "bold"; style: "normal" | "italic" } {
  const combined = `${rawFontName} ${pdfjsFamily ?? ""}`;
  return {
    weight: BOLD_RE.test(combined)   ? "bold"   : "normal",
    style:  ITALIC_RE.test(combined) ? "italic" : "normal",
  };
}

// ─── Public: resolve a PDF font name to FontInfo ──────────────────────────────

export function resolvePdfFont(
  rawFontName: string,
  pdfjsFamily?: string,
  pdfjsFontWeight?: string | number,
): FontInfo {
  let { weight, style } = detectWeightStyle(rawFontName, pdfjsFamily);

  // pdfjs style.fontWeight overrides when it indicates bold
  if (pdfjsFontWeight) {
    const fw = String(pdfjsFontWeight).toLowerCase();
    if (fw === "bold" || fw === "bolder" || Number(fw) >= 600) weight = "bold";
  }

  const cleaned = cleanFontName(rawFontName).toLowerCase();

  for (const [key, val] of Object.entries(FONT_MAP)) {
    if (cleaned.includes(key)) {
      const family = val.google
        ? `"${val.google}", ${val.generic}`
        : val.generic;
      return { family, weight, style, googleFamily: val.google, generic: val.generic };
    }
  }

  if (pdfjsFamily && pdfjsFamily !== "sans-serif" && pdfjsFamily !== "serif" && pdfjsFamily !== "monospace") {
    const lowered = pdfjsFamily.toLowerCase();
    for (const [key, val] of Object.entries(FONT_MAP)) {
      if (lowered.includes(key)) {
        const family = val.google
          ? `"${val.google}", ${val.generic}`
          : val.generic;
        return { family, weight, style, googleFamily: val.google, generic: val.generic };
      }
    }
    return { family: `"${pdfjsFamily}", sans-serif`, weight, style, generic: "sans-serif" };
  }

  if (/courier|mono|typewriter|consolat/i.test(cleaned))
    return { family: '"Courier Prime", monospace', weight, style, googleFamily: "Courier Prime", generic: "monospace" };
  if (/times|georgia|garamond|palatino|minion|caslon|bodoni|didot|baskerville/i.test(cleaned))
    return { family: '"Tinos", serif', weight, style, googleFamily: "Tinos", generic: "serif" };

  return { family: '"Inter", sans-serif', weight, style, googleFamily: "Inter", generic: "sans-serif" };
}

// ─── Public: build individual CSS style props (NOT shorthand) ─────────────────

export function buildStyleProps(fontSize: number, info: FontInfo, height?: number): FontStyleProps {
  return {
    fontFamily: info.family,
    fontWeight: info.weight,
    fontStyle: info.style,
    fontSize: `${fontSize}px`,
    lineHeight: height ? `${height}px` : `${fontSize * 1.2}px`,
  };
}

/** Build a canvas-compatible font string */
export function buildCanvasFont(fontSize: number, info: FontInfo): string {
  const parts: string[] = [];
  if (info.style === "italic") parts.push("italic");
  if (info.weight === "bold") parts.push("bold");
  parts.push(`${fontSize}px`);
  parts.push(info.family);
  return parts.join(" ");
}

// ─── Dynamic Google Fonts loader ──────────────────────────────────────────────

const loadedFamilies = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

/**
 * Load a Google Font family with all needed weights (400, 700) and italic variants.
 * Waits for the browser to actually download + parse the .woff2 files via
 * document.fonts.ready AND a probing check.
 */
export async function loadGoogleFont(family: string, weights?: number[]): Promise<void> {
  if (!family || typeof document === "undefined") return;
  if (loadedFamilies.has(family)) return;

  const existing = loadingPromises.get(family);
  if (existing) return existing;

  const w = weights ?? [400, 700];
  const wParam = w.map(v => `0,${v}`).concat(w.map(v => `1,${v}`)).join(";");
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@${wParam}&display=swap`;

  const promise = new Promise<void>((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = async () => {
      try {
        await document.fonts.ready;
        // Probe: try loading explicit FontFace entries so the browser fetches the binary
        const probes = w.flatMap(wt => [
          document.fonts.load(`${wt} 16px "${family}"`),
          document.fonts.load(`italic ${wt} 16px "${family}"`),
        ]);
        await Promise.allSettled(probes);
        await document.fonts.ready;
      } catch { /* ignore probe errors */ }
      loadedFamilies.add(family);
      resolve();
    };
    link.onerror = () => { resolve(); };
    document.head.appendChild(link);
  });

  loadingPromises.set(family, promise);
  return promise;
}

export async function preloadFonts(infos: FontInfo[]): Promise<void> {
  const families = new Set<string>();
  for (const info of infos) {
    if (info.googleFamily) families.add(info.googleFamily);
  }
  await Promise.all([...families].map(f => loadGoogleFont(f)));
  if (typeof document !== "undefined") {
    await document.fonts.ready;
  }
}

/** Wait for fonts to be ready (call before canvas fillText) */
export async function waitForFonts(): Promise<void> {
  if (typeof document !== "undefined") {
    await document.fonts.ready;
  }
}

/**
 * Check that the browser actually has a bold variant loaded for the given family.
 * Useful to verify Google Fonts loaded the 700 wght file.
 */
export function isBoldFontAvailable(family: string): boolean {
  if (typeof document === "undefined") return false;
  return document.fonts.check(`bold 16px ${family}`);
}
