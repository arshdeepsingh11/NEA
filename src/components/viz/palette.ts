/**
 * Chart colours, validated for the dark glass surface (#0B1120):
 * lightness band, chroma floor, colour-blind separation (all pairs) and 3:1 contrast all pass.
 * Use slots in this order. A single series always uses slot 1.
 * Text never takes a series colour; it stays in ink / graphite.
 */
export const VIZ = {
  series: ["#14A894", "#D9643A", "#7C6CF0"] as const,
  grid: "rgba(255,255,255,0.07)",
  axis: "rgba(255,255,255,0.45)",
  surface: "#0B1120",
  // Status is reserved for in/out of range and always ships with a label.
  good: "#14A894",
  watch: "#D9A43A",
  out: "#E0605A",
};
