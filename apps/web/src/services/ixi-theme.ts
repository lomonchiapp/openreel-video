import { useThemeStore } from "@/stores/theme-store";

// La Apariencia del estudio (ixipost) también viste al editor de video.
// Same-origin bajo ixipost.com/video → localStorage compartido: se lee el
// tema elegido en el estudio ("ixipost-theme") y se mapea a modo + acento.

const THEME_MAP: Record<string, { mode: "dark" | "light"; accent: string; strong: string; primary: string }> = {
  dark:      { mode: "dark",  accent: "#c163d8", strong: "#ad4cc5", primary: "288 60% 62%" },
  glass:     { mode: "dark",  accent: "#7C6FFF", strong: "#6a5ce6", primary: "246 100% 74%" },
  brutalism: { mode: "light", accent: "#FF0022", strong: "#d60020", primary: "352 100% 50%" },
  neo:       { mode: "light", accent: "#6B5CE7", strong: "#5947d1", primary: "247 74% 63%" },
};

export function applyIxiTheme(): void {
  try {
    const stored = localStorage.getItem("ixipost-theme") || "dark";
    const cfg = THEME_MAP[stored] || THEME_MAP.dark;
    useThemeStore.getState().setMode(cfg.mode);
    const r = document.documentElement.style;
    r.setProperty("--accent", cfg.accent);
    r.setProperty("--accent-strong", cfg.strong);
    r.setProperty("--accent-soft", `color-mix(in srgb, ${cfg.accent} 16%, transparent)`);
    r.setProperty("--accent-glow", `color-mix(in srgb, ${cfg.accent} 40%, transparent)`);
    r.setProperty("--primary", cfg.primary);
  } catch { /* sin localStorage: quedan los tokens propios */ }
}

// Cambios de tema hechos en el estudio (otra pestaña) se reflejan en vivo
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "ixipost-theme") applyIxiTheme();
  });
}
