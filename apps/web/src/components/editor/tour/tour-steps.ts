export interface TourStep {
  id: string;
  target: string | null;
  title: string;
  description: string;
  tips?: string[];
  position: "center" | "top" | "bottom" | "left" | "right";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: null,
    title: "Bienvenido a ixipost video",
    description: "Hagamos un tour rápido por el editor",
    position: "center",
  },
  {
    id: "assets",
    target: "[data-tour='assets']",
    title: "Panel de recursos",
    description: "Tu kit creativo. Importa medios, genera contenido con IA, agrega formas, stickers y SVGs propios.",
    tips: [
      "Arrastra y suelta videos, audio e imágenes",
      "Pestaña AI Gen: genera imágenes y fondos con IA",
      "Formas e importación de SVG propios",
      "Stickers, fondos y superposiciones",
    ],
    position: "right",
  },
  {
    id: "timeline",
    target: "[data-tour='timeline']",
    title: "Línea de tiempo",
    description: "Organiza y edita tus clips. Arrastra para mover; arrastra los bordes para recortar.",
    tips: ["Presiona S para dividir clips", "Espacio para reproducir/pausar", "Scroll para hacer zoom"],
    position: "top",
  },
  {
    id: "preview",
    target: "[data-tour='preview']",
    title: "Vista previa",
    description: "Mira tu video en tiempo real mientras editas.",
    tips: [
      "Flechas para navegar por fotogramas",
      "Haz clic para desplazarte",
      "Pantalla completa disponible",
    ],
    position: "left",
  },
  {
    id: "inspector",
    target: "[data-tour='inspector']",
    title: "Inspector",
    description:
      "Selecciona un clip para ver sus propiedades. Agrega efectos, ajusta colores, anima.",
    tips: [
      "Transformación, efectos, corrección de color",
      "Anima cualquier propiedad con fotogramas clave",
      "Herramientas con IA",
    ],
    position: "left",
  },
  {
    id: "complete",
    target: null,
    title: "¡Listo para crear!",
    description: "¡Empieza a crear! Presiona ? en cualquier momento para ver los atajos.",
    position: "center",
  },
];

export const ONBOARDING_KEY = "openreel-onboarding-complete";
