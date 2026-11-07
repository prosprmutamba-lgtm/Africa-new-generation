import Link from "next/link";
import { defaultLocale } from "@/lib/i18n";

/**
 * Fallback for any URL that doesn't match the [locale] segment at all
 * (e.g. a malformed path caught before middleware locale detection).
 * Kept minimal and dependency-free since it renders outside the
 * NextIntlClientProvider/Header/Footer tree. The in-locale 404
 * (app/[locale]/not-found.tsx) is what visitors will see in practice.
 */
export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale}>
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
            textAlign: "center",
            padding: "2rem",
            background: "#F5F7FA",
            color: "#282C37",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Page Not Found</h1>
          <p style={{ color: "#556270" }}>The page you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href={`/${defaultLocale}`}
            style={{
              background: "#004CC0",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
