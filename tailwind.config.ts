import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Mission OS Design Tokens
        mission: {
          bg: "#0A0F1E",
          "bg-secondary": "#0F1629",
          "bg-card": "#111827",
          "bg-elevated": "#1A2035",
          border: "#1E2D45",
          "border-glow": "#00D4FF33",
        },
        cyan: {
          DEFAULT: "#00D4FF",
          dim: "#00D4FF99",
          glow: "#00D4FF22",
        },
        phosphor: {
          DEFAULT: "#39FF14",
          dim: "#39FF1499",
          glow: "#39FF1422",
        },
        amber: {
          mission: "#F59E0B",
          dim: "#F59E0B99",
        },
        // shadcn/ui tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-cyan": {
          "0%, 100%": { boxShadow: "0 0 0 0 #00D4FF44" },
          "50%": { boxShadow: "0 0 0 8px #00D4FF00" },
        },
        "pulse-phosphor": {
          "0%, 100%": { boxShadow: "0 0 0 0 #39FF1444" },
          "50%": { boxShadow: "0 0 0 8px #39FF1400" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "xp-flash": {
          "0%": { opacity: "0", transform: "translateY(0) scale(1)" },
          "30%": { opacity: "1", transform: "translateY(-20px) scale(1.2)" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(0.9)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-cyan": "pulse-cyan 2s ease-in-out infinite",
        "pulse-phosphor": "pulse-phosphor 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "xp-flash": "xp-flash 1.2s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "mission-grid": "linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)",
        "card-glow": "linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%)",
        shimmer: "linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%)",
      },
      backgroundSize: {
        "mission-grid": "40px 40px",
        shimmer: "200% 100%",
      },
      boxShadow: {
        "cyan-glow": "0 0 20px rgba(0, 212, 255, 0.3)",
        "phosphor-glow": "0 0 20px rgba(57, 255, 20, 0.3)",
        "card-mission": "0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
