import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem" }, screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        // v2 "NEA Intelligence": deep night base, aurora accents, glass surfaces
        porcelain: "#060912", // page background
        mist: "#0D1322", // subtle raised surface
        ink: "#EEF2FA", // primary text
        graphite: "#9AA6BC", // secondary text
        abyss: "#03050A", // deepest background
        flora: { DEFAULT: "#5EEAD4", soft: "rgba(94,234,212,0.10)", deep: "#2DD4BF" }, // aqua: biology, health
        sky: { DEFAULT: "#7DD3FC", soft: "rgba(125,211,252,0.10)" }, // data, signals
        lumen: { DEFAULT: "#A5B4FC", soft: "rgba(165,180,252,0.12)" }, // AI, laser
        orchid: { DEFAULT: "#E9A8F5", soft: "rgba(233,168,245,0.10)" }, // hormones, feminine health
        dermis: { DEFAULT: "#FDBA94", deep: "#F59E7A" }, // skin warmth
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Modular scale (1.25) tuned for long-form reading and Apple-style display sizes.
        "display-xl": ["clamp(3rem, 7.5vw, 6.5rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2.4rem, 5vw, 4.25rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(1.9rem, 3.4vw, 2.9rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        lede: ["clamp(1.125rem, 1.6vw, 1.35rem)", { lineHeight: "1.55", letterSpacing: "-0.01em" }],
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.75rem" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(calc(-100% - var(--gap)))" } },
        "marquee-vertical": { from: { transform: "translateY(0)" }, to: { transform: "translateY(calc(-100% - var(--gap)))" } },
        shine: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        aurora: {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(4%,-3%,0) scale(1.08)" },
          "100%": { transform: "translate3d(0,0,0) scale(1)" },
        },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100%)" } },
        pulseglow: { "0%,100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        shine: "shine var(--shine-duration) infinite linear",
        blink: "blink 1.1s step-end infinite",
        aurora: "aurora 22s ease-in-out infinite",
        scan: "scan 3.2s cubic-bezier(0.65,0,0.35,1) infinite",
        pulseglow: "pulseglow 2.6s ease-in-out infinite",
      },
      transitionTimingFunction: { apple: "cubic-bezier(0.25, 0.1, 0.25, 1)", spring: "cubic-bezier(0.32, 0.72, 0, 1)" },
    },
  },
  plugins: [],
};

export default config;
