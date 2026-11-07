import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Africa New Generation (ANG) — Tailwind Design Tokens
 * Colors are derived from the Africa New Generation (ANG) logo palette.
 * Edit these values to update the site-wide color system in one place.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic tokens — map to the CSS variables defined in
        // app/globals.css (which in turn derive from the brand.* hexes
        // below). This is what makes bg-background, border-border,
        // text-foreground, bg-card, bg-primary, etc. resolve at all —
        // every shadcn-pattern component (Button, Card, Input...) and
        // most of DESIGN_SYSTEM.md's utility classes depend on this.
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // Brand palette — direct hex values (not CSS variables) for cases
        // that intentionally never change with dark mode (header, hero,
        // footer, gold accents). See DESIGN_SYSTEM.md §2.
        brand: {
          blue: {
            DEFAULT: "#004CC0", // ANG Blue #004CC0 — brand primary (official charter)
            50: "#EBF1FA",
            100: "#D1DFF4",
            200: "#A3BFE8",
            300: "#709BDC",
            400: "#3873CE",
            500: "#004CC0", // ANG Blue #004CC0 — brand primary (official charter)
            600: "#003E9D",
            700: "#00317B",
            800: "#002358",
            900: "#001536",
          },
          gold: {
            DEFAULT: "#F3AC02", // ANG Yellow #F3AC02 — accent (official charter)
            50: "#FEF8EB",
            100: "#FDF0D1",
            200: "#FBE1A4",
            300: "#F8D171",
            400: "#F6BE3A",
            500: "#F3AC02", // ANG Yellow #F3AC02 — accent (official charter)
            600: "#C78D02",
            700: "#9C6E01",
            800: "#704F01",
            900: "#443001",
          },
          red: {
            DEFAULT: "#DE2325", // ANG Red #DE2325 — accent, sparingly (official charter)
            50: "#FCEDEE",
            100: "#F9D7D8",
            200: "#F3B0B1",
            300: "#ED8485",
            400: "#E55355",
            500: "#DE2325", // ANG Red #DE2325 — accent, sparingly (official charter)
            600: "#B61D1E",
            700: "#8E1618",
            800: "#661011",
            900: "#3E0A0A",
          },
          // ANG Anthracite #282C37 — text and dark backgrounds. Kept under the
          // historical key "navy" so existing classes (text-brand-navy, bg-brand-navy) follow the charter.
          navy: "#282C37",
          anthracite: "#282C37",
          gray: {
            light: "#F5F7FA", // Light Gray (neutral surface)
          },
        },
      },
      fontFamily: {
        heading: ["var(--font-anton)", "Impact", "Haettenschweiler", "Arial Narrow Bold", "sans-serif"],
        body: ["var(--font-montserrat)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(10, 31, 51, 0.15)",
        card: "0 4px 20px -4px rgba(10, 31, 51, 0.10)",
      },
      spacing: {
        section: "6rem",
        "section-sm": "3.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "loading-bar": "loading-bar 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
