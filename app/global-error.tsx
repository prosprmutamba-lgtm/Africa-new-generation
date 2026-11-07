"use client";

/**
 * Last-resort error boundary — only triggers if the root layout itself
 * throws (meaning even Header/Footer/NextIntlClientProvider may be
 * unavailable), so this must render its own <html>/<body> and cannot
 * depend on next-intl, Tailwind's design tokens, or any app component.
 * The in-locale error boundary (app/[locale]/error.tsx) is what visitors
 * will see for ordinary page-level errors.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
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
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Something Went Wrong</h1>
          <p style={{ color: "#556270" }}>An unexpected error occurred. Please try again.</p>
          <button
            onClick={reset}
            style={{
              background: "#004CC0",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
