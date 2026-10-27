import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem" }, screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        porcelain: "#F5F6F3",
        mist: "#E8EBE7",
        ink: "#15191C",
        graphite: "#596167",
        flora: { DEFAULT: "#2F7D6D", soft: "#DCEDE7", deep: "#1D5A4E" },
        dermis: { DEFAULT: "#E7C3B5", deep: "#B9826F" },
        lumen: { DEFAULT: "#6E6BF5", soft: "#E6E5FD" },
        abyss: "#0C1214",
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
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        shine: "shine var(--shine-duration) infinite linear",
        blink: "blink 1.1s step-end infinite",
      },
      transitionTimingFunction: { apple: "cubic-bezier(0.25, 0.1, 0.25, 1)", spring: "cubic-bezier(0.32, 0.72, 0, 1)" },
    },
  },
  plugins: [],
};

export default config;
