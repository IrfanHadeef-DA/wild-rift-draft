import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Base surfaces — cream/parchment, International 2016 inspired ──
        "surface-0": "#1A1410",   // deepest background — near-black warm brown
        "surface-1": "#2A2018",   // card background — dark espresso
        "surface-2": "#3A2D20",   // elevated card — warm umber
        "surface-3": "#4A3A28",   // hover state — lighter umber

        // Parchment surfaces (used for light card insets, champion grid bg)
        "parchment": "#EDE0C8",
        "parchment-dark": "#D9C7A0",

        // Borders
        "border-subtle": "#4A3D2E",
        "border-default": "#6B5639",
        "border-strong": "#8C7048",

        // Text hierarchy
        "text-primary": "#F5EAD3",
        "text-secondary": "#C9B894",
        "text-muted": "#8A7860",

        // Accent — deep burgundy/maroon, the I2016 signature color
        accent: {
          DEFAULT: "#8C2F39",
          dim: "#3D1418",
          glow: "rgba(140,47,57,0.25)",
        },

        // Gold — ornate trim, the "coach pick" highlight
        gold: {
          DEFAULT: "#C9A227",
          dim: "#4A3A10",
          glow: "rgba(201,162,39,0.2)",
        },

        // Semantic
        success: "#5C8A3A",
        warning: "#C9A227",
        danger: "#8C2F39",
        info: "#7A6B8C",

        // Role colors — muted jewel tones to match the ceremonial palette
        role: {
          support: "#9B7AA8",
          jungle: "#5C8A5C",
          mid: "#7A8CAB",
          baron: "#A85C42",
          dragon: "#C9A227",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1.0625rem", { lineHeight: "1.625rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "6px",
        lg: "10px",
        xl: "14px",
        "2xl": "18px",
      },
      boxShadow: {
        "accent-glow": "0 0 20px rgba(140,47,57,0.35)",
        "gold-glow": "0 0 24px rgba(201,162,39,0.25)",
        "card": "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,61,46,0.8)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(107,86,57,0.9)",
        "ornate": "inset 0 0 0 1px rgba(201,162,39,0.3), 0 2px 8px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(201,162,39,0.15)" },
          "50%": { boxShadow: "0 0 24px rgba(201,162,39,0.4)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-subtle": "linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.1) 50%, transparent 100%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
