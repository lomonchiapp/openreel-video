import React, { useEffect, useState } from "react";

// Candado ixipost: el editor de video es parte de la suite. Valida la sesión
// contra ixipost.com (/api/me, CORS con credenciales — la cookie de sesión se
// comparte entre subdominios). En desarrollo local no bloquea.

const IXIPOST = "https://ixipost.com";

const Mark: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="10" fill="#FF3652" />
    <g transform="rotate(22.5 24 24)">
      <circle cx="9" cy="24" r="3.4" fill="#fff" />
      <path d="M17.8 17.8 L30.2 30.2 M30.2 17.8 L17.8 30.2" stroke="#fff" strokeWidth="5.8" strokeLinecap="round" />
      <circle cx="39" cy="24" r="3.4" fill="#fff" />
    </g>
  </svg>
);

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<"checking" | "ok" | "denied">(
    import.meta.env.DEV ? "ok" : "checking"
  );

  useEffect(() => {
    if (import.meta.env.DEV) return;
    let alive = true;
    fetch(`${IXIPOST}/api/me`, { credentials: "include" })
      .then((r) => { if (alive) setState(r.ok ? "ok" : "denied"); })
      .catch(() => { if (alive) setState("denied"); });
    return () => { alive = false; };
  }, []);

  if (state === "ok") return <>{children}</>;

  return (
    <div style={{
      height: "100vh", width: "100vw", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
      background: "#101014", color: "#e6e6ea",
      fontFamily: "'Geist', system-ui, sans-serif", textAlign: "center", padding: 24,
    }}>
      <Mark />
      {state === "checking" ? (
        <p style={{ fontSize: 14, color: "#9a9aa2" }}>Verificando tu sesión…</p>
      ) : (
        <>
          <div>
            <h1 style={{ fontSize: 22, margin: 0, fontFamily: "'Syne', system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}>
              ixipost <span style={{ opacity: 0.6 }}>video</span>
            </h1>
            <p style={{ fontSize: 14, color: "#9a9aa2", maxWidth: 420, marginTop: 10, lineHeight: 1.6 }}>
              El editor de video es parte de tu cuenta de ixipost.
              Inicia sesión y vuelve — quedarás conectado automáticamente.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={`${IXIPOST}/login`}
              style={{
                background: "#FF3652", color: "#fff", textDecoration: "none",
                padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600,
              }}>
              Iniciar sesión en ixipost
            </a>
            <button onClick={() => location.reload()}
              style={{
                background: "transparent", color: "#9a9aa2", border: "1px solid #33333b",
                padding: "12px 20px", borderRadius: 12, fontSize: 14, cursor: "pointer",
              }}>
              Ya inicié sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
};
