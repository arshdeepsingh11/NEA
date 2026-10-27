/**
 * Chart colours come from the active theme (globals.css → --viz-*).
 * Both theme sets were validated on their page surface: lightness band, chroma floor,
 * colour-blind separation (all pairs), normal-vision floor and 3:1 contrast.
 * Use slots in this order. A single series always uses slot 1. Text never takes a series colour.
 */
export const VIZ = {
  series: ["rgb(var(--viz-1))", "rgb(var(--viz-2))", "rgb(var(--viz-3))"] as const,
  /** same colours with alpha, for fills */
  seriesA: (i: 0 | 1 | 2, a: number) => `rgb(var(--viz-${i + 1}) / ${a})`,
  grid: "rgb(var(--c-ink) / 0.08)",
  axis: "rgb(var(--c-ink) / 0.5)",
  track: "rgb(var(--c-ink) / 0.07)",
  surface: "#FFFFFF",
  // Status is reserved for in/out of range and always ships with a label.
  good: "rgb(var(--viz-good))",
  watch: "rgb(var(--viz-watch))",
  out: "#C0392B",
};
