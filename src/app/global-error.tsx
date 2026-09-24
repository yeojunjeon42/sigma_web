"use client";

import Link from "next/link";

// The last resort, drawn without the root layout: plain paper, the name's colours, a way back.

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#dfe1dc", color: "#0f110d", fontFamily: "ui-sans-serif, system-ui, sans-serif", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <main style={{ padding: "clamp(16px, 4vw, 48px)" }}>
          <p style={{ fontSize: "clamp(5rem, 22vw, 16rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.8, margin: "0 0 2rem" }} aria-hidden="true">
            Error
          </p>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 400, margin: "0 0 1rem" }}>Something broke while loading the site.</h1>
          <p style={{ display: "flex", gap: "1.5rem", margin: 0 }}>
            <button type="button" onClick={reset} style={{ font: "inherit", fontSize: "1rem", background: "none", border: 0, padding: "0.75rem 0", textDecoration: "underline", cursor: "pointer", color: "inherit" }}>
              Try again
            </button>
            <Link href="/" style={{ padding: "0.75rem 0", color: "#4d514a" }}>
              Home
            </Link>
          </p>
        </main>
        <footer style={{ background: "#f0d8d1", padding: "2rem clamp(16px, 4vw, 48px)", fontSize: "0.8125rem", color: "#4d514a" }}>© Sigma Intelligence · EST. 1984</footer>
      </body>
    </html>
  );
}
