import { Anton, Montserrat } from "next/font/google";

/**
 * Africa New Generation (ANG) — official brand typography (see the graphic charter)
 *
 *   Anton       → headlines and hooks      (font-heading)   one weight (400)
 *   Montserrat  → body, subtitles, captions, UI (font-body)  400 / 500 / 600 / 700
 *
 * Loaded through next/font/google: Next.js downloads the files at BUILD time and
 * serves them from your own domain (no request to Google by visitors). The build
 * machine therefore needs internet access once.
 *
 * To use LOCAL font files instead (no network at build), download Anton-Regular.ttf
 * and the Montserrat static weights, put them in app/fonts/, and replace the two
 * declarations below with next/font/local, keeping the same `variable` names:
 *
 *   import localFont from "next/font/local";
 *   export const anton = localFont({ src: "../app/fonts/Anton-Regular.ttf", variable: "--font-anton", display: "swap" });
 *   export const montserrat = localFont({
 *     src: [
 *       { path: "../app/fonts/Montserrat-Regular.ttf", weight: "400" },
 *       { path: "../app/fonts/Montserrat-Medium.ttf", weight: "500" },
 *       { path: "../app/fonts/Montserrat-SemiBold.ttf", weight: "600" },
 *       { path: "../app/fonts/Montserrat-Bold.ttf", weight: "700" },
 *     ],
 *     variable: "--font-montserrat",
 *     display: "swap",
 *   });
 */
export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Backwards-compatible names (the previous font pair) so unseen imports keep compiling. */
export const poppins = anton;
export const inter = montserrat;

export const fontVariables = `${anton.variable} ${montserrat.variable}`;
