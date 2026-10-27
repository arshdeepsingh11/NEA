import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem" }, screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        // v3 "NEA Intelligence · Light": airy porcelain base, frosted glass, aurora accents tuned for light
        porcelain: "#F4F7FB", // page background
        mist: "#E9EEF5", // subtle raised surface
        ink: "#0B1324", // primary text
        graphite: "#556175", // secondary text (≥ 5:1 on white)
        abyss: "#0B1324", // overlays on photos
        flora: { DEFAULT: "#0F8A7E", soft: "rgba(15,138,126,0.10)", deep: "#0B6F65" }, // teal: biology, health
        sky: { DEFAULT: "#0284C7", soft: "rgba(2,132,199,0.10)" }, // data, signals
        lumen: { DEFAULT: "#5B5BD6", soft: "rgba(91,91,214,0.10)" }, // AI, laser
        orchid: { DEFAULT: "#B5179E", soft: "rgba(181,23,158,0.08)" }, // hormones, feminine health
        dermis: { DEFAULT: "#F2A07B", deep: "#D9774F" }, // skin warmth
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
