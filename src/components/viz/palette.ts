/**
 * Chart colours, validated on the light glass surface (#FFFFFF):
 * lightness band, chroma floor, colour-blind separation (all pairs), normal-vision floor and 3:1 contrast all pass.
 * Use slots in this order. A single series always uses slot 1.
 * Text never takes a series colour; it stays in ink / graphite.
 */
export const VIZ = {
  series: ["#0A9384", "#D9643A", "#6157D9"] as const,
  grid: "rgba(11,19,36,0.08)",
  axis: "rgba(11,19,36,0.5)",
  track: "rgba(11,19,36,0.07)",
  surface: "#FFFFFF",
  // Status is reserved for in/out of range and always ships with a label.
  good: "#0A9384",
  watch: "#C98500",
  out: "#D64545",
};
