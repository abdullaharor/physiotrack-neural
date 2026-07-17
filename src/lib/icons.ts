/**
 * ICONS — SVG icon registry, ported verbatim from PhysioTrack v3
 * (the `ICONS` object in the dc-runtime script). Rendered via <Icon/>.
 */
export const ICONS: Record<string, string> = {
  dashboard: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  patients: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.2M21 20a5 5 0 0 0-4-4.9"/></svg>',
  appointments: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>',
  invoices: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.5h9l4 4V21a.5.5 0 0 1-.7.5l-2-1-2 1-2-1-2 1-2-1-2 1a.5.5 0 0 1-.8-.5V4a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M9 9h6M9 13h6"/></svg>',
  team: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  anatomy: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2.2"/><path d="M12 6.7V15M12 9L7 11M12 9l5 2M12 15l-3 6M12 15l3 6"/></svg>',
  devices: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 2v20M12 2l4 3.5L12 9M12 22l4-3.5L12 15"/></svg>',
  search: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>',
  assess: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  angle: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L12 4M4 20h16M9.5 20a9 9 0 0 0-1.2-4.5"/></svg>',
  wave: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h3l2.5-6 4 12 2.5-6h3M20 12h2"/></svg>',
};

import React from "react";
import type { CSSProperties } from "react";
import { sx } from "./sx";

/** Renders an SVG icon string from the registry (or a raw string). */
export function Icon(props: {
  name?: keyof typeof ICONS | string;
  html?: string;
  sx?: string | CSSProperties;
  as?: "span" | "div";
}) {
  const raw = props.html ?? (props.name ? ICONS[props.name] : "") ?? "";
  const style = typeof props.sx === "string" ? sx(props.sx) : props.sx;
  const Tag = props.as ?? "span";
  return React.createElement(Tag, {
    style,
    dangerouslySetInnerHTML: { __html: raw },
  });
}
