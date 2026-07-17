import type { CSSProperties } from "react";

/**
 * sx() — parse a CSS declaration string into a React style object.
 *
 * This is the fidelity keystone of the migration. The PhysioTrack v3 UI
 * (a Claude Design "dc-runtime" export) expresses every element's styling
 * as an inline CSS string. Rather than hand-convert hundreds of those
 * strings into object literals (and risk visual drift), we keep the exact
 * v3 strings and parse them at runtime into the object shape React needs.
 *
 * Supported faithfully:
 *  - CSS custom properties (`--color-x`) are kept verbatim as keys.
 *  - Vendor-prefixed props (`-webkit-…`) become React's `Webkit…` form.
 *  - Logical props already in camelCase (`insetInlineStart`) pass through.
 *  - Values may contain commas/parens (color-mix, gradients, cubic-bezier);
 *    we split declarations on `;` and each declaration on its FIRST `:`.
 */

const cache = new Map<string, CSSProperties>();

function toCamel(prop: string): string {
  const p = prop.trim();
  if (p.startsWith("--")) return p; // CSS variable — keep as-is
  // `-webkit-backdrop-filter` -> `WebkitBackdropFilter`,
  // `padding-inline-start` -> `paddingInlineStart`
  return p.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
}

export function sx(css: string): CSSProperties {
  if (!css) return {};
  const hit = cache.get(css);
  if (hit) return hit;

  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const seg = decl.trim();
    if (!seg) continue;
    const idx = seg.indexOf(":");
    if (idx === -1) continue;
    const prop = seg.slice(0, idx).trim();
    const val = seg.slice(idx + 1).trim();
    if (!prop) continue;
    out[toCamel(prop)] = val;
  }
  const frozen = out as CSSProperties;
  cache.set(css, frozen);
  return frozen;
}

/** Merge several CSS strings / style objects into one style object. */
export function mergeSx(
  ...parts: Array<string | CSSProperties | undefined | null | false>
): CSSProperties {
  const acc: Record<string, unknown> = {};
  for (const part of parts) {
    if (!part) continue;
    const obj = typeof part === "string" ? sx(part) : part;
    Object.assign(acc, obj);
  }
  return acc as CSSProperties;
}
