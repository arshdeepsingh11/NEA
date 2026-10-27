import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem" }, screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        // v4: every colour is a theme variable (see globals.css: [data-theme="pearl"] / [data-theme="sand"])
        porcelain: "rgb(var(--c-bg) / <alpha-value>)", // page background
        mist: "rgb(var(--c-mist) / <alpha-value>)", // raised surface
        ink: "rgb(var(--c-ink) / <alpha-value>)", // primary text
        graphite: "rgb(var(--c-graphite) / <alpha-value>)", // secondary text
        abyss: "rgb(var(--c-ink) / <alpha-value>)", // overlays on photos
        flora: { DEFAULT: "rgb(var(--c-accent) / <alpha-value>)", soft: "rgb(var(--c-accent) / 0.10)", deep: "rgb(var(--c-accent-deep) / <alpha-value>)" },
        sky: { DEFAULT: "rgb(var(--c-accent3) / <alpha-value>)", soft: "rgb(var(--c-accent3) / 0.10)" },
        lumen: { DEFAULT: "rgb(var(--c-accent2) / <alpha-value>)", soft: "rgb(var(--c-accent2) / 0.10)" },
        orchid: { DEFAULT: "rgb(var(--c-accent2) / <alpha-value>)", soft: "rgb(var(--c-accent2) / 0.08)" },
        dermis: { DEFAULT: "rgb(var(--c-warm) / <alpha-value>)", deep: "rgb(var(--c-warm-deep) / <alpha-value>)" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Modular scale (1.25) tuned for long-form reading and Apple-style display sizes.
        "display-xl": ["clamp(3.2rem, 8vw, 7.2rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.6rem, 5.4vw, 4.8rem)", { lineHeight: "1", letterSpacing: "-0.018em" }],
        "display-md": ["clamp(2.1rem, 3.8vw, 3.4rem)", { lineHeight: "1.04", letterSpacing: "-0.015em" }],
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
