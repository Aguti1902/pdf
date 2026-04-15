/**
 * PDF Font Resolution & Dynamic Google Fonts Loader
 *
 * Maps internal PDF font names (e.g. "BCDEEE+Calibri-Bold") to real
 * CSS font-family names and loads matching Google Fonts on demand.
 */

// ─── PDF font name → web font mapping ────────────────────────────────────────

interface FontInfo {
  family: string;          // CSS font-family value
  weight: "normal" | "bold";
  style: "normal" | "italic";
  googleFamily?: string;   // Google Fonts family name (if available)
  generic: string;         // fallback generic: serif | sans-serif | monospace
}

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

/** Strip PDF-internal prefix like "BCDEEE+" and suffixes like ",Bold" "-BoldItalic" */
function cleanFontName(raw: string): string {
  return raw
    .replace(/^[A-Z]{6}\+/, "")     // strip subset prefix
    .replace(/[-,](bold|italic|oblique|regular|medium|light|semibold|book|roman|condensed|narrow|extended|heavy|black|thin|extra\s*light)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Detect weight/style from the raw PDF font name */
function detectWeightStyle(raw: string): { weight: "normal" | "bold"; style: "normal" | "italic" } {
  const n = raw.toLowerCase();
  return {
    weight: /bold|heavy|black|semibold/i.test(n) ? "bold" : "normal",
    style:  /italic|oblique/i.test(n) ? "italic" : "normal",
  };
}

/** Resolve a PDF internal font name to a full FontInfo */
export function resolvePdfFont(rawFontName: string, pdfjsFamily?: string): FontInfo {
  const { weight, style } = detectWeightStyle(rawFontName);
  const cleaned = cleanFontName(rawFontName).toLowerCase();

  // Try exact match in our map
  for (const [key, val] of Object.entries(FONT_MAP)) {
    if (cleaned.includes(key)) {
      const family = val.google
        ? `"${val.google}", ${val.generic}`
        : val.generic;
      return { family, weight, style, googleFamily: val.google, generic: val.generic };
    }
  }

  // Use pdfjs-provided family if available
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

  // Fallback: detect generic family
  if (/courier|mono|typewriter|consolat/i.test(cleaned))
    return { family: '"Courier Prime", monospace', weight, style, googleFamily: "Courier Prime", generic: "monospace" };
  if (/times|georgia|garamond|palatino|minion|caslon|bodoni|didot|baskerville/i.test(cleaned))
    return { family: '"Tinos", serif', weight, style, googleFamily: "Tinos", generic: "serif" };

  return { family: '"Inter", sans-serif', weight, style, googleFamily: "Inter", generic: "sans-serif" };
}

// ─── Dynamic Google Fonts loader ──────────────────────────────────────────────

const loadedFamilies = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

/** Load a Google Font family into the document (idempotent, returns when loaded) */
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
    link.onload = () => { loadedFamilies.add(family); resolve(); };
    link.onerror = () => { resolve(); }; // don't block on failure
    document.head.appendChild(link);
  });

  loadingPromises.set(family, promise);
  return promise;
}

/** Pre-load all Google Fonts needed for a set of font infos */
export async function preloadFonts(infos: FontInfo[]): Promise<void> {
  const families = new Set<string>();
  for (const info of infos) {
    if (info.googleFamily) families.add(info.googleFamily);
  }
  await Promise.all([...families].map(f => loadGoogleFont(f)));
}

/** Build a complete CSS font shorthand */
export function buildCssFont(fontSize: number, info: FontInfo): string {
  const parts: string[] = [];
  if (info.style === "italic") parts.push("italic");
  if (info.weight === "bold") parts.push("bold");
  parts.push(`${fontSize}px`);
  parts.push(info.family);
  return parts.join(" ");
}
