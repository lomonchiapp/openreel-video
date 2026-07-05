export interface MoGraphTourStep {
  id: string;
  target: string | null;
  title: string;
  description: string;
  tips?: string[];
  position: "center" | "top" | "bottom" | "left" | "right";
  action?: "highlight" | "demo";
}

export const MOGRAPH_TOUR_STEPS: MoGraphTourStep[] = [
  {
    id: "intro",
    target: null,
    title: "Motion graphics y animación",
    description:
      "Aprende a crear animaciones profesionales con fotogramas clave, rutas de movimiento y efectos de partículas.",
    position: "center",
  },
  {
    id: "keyframes-inspector",
    target: "[data-tour='inspector']",
    title: "Animación con fotogramas clave",
    description:
      "Selecciona un clip y expande la sección Fotogramas clave del Inspector. Agrega fotogramas clave para animar posición, escala, rotación y opacidad.",
    tips: [
      "Haz clic en el rombo para agregar un fotograma clave en el tiempo actual",
      "Cada propiedad puede tener su propia curva de animación",
      "Elige entre más de 30 presets de easing para un movimiento suave",
    ],
    position: "left",
  },
  {
    id: "keyframes-timeline",
    target: "[data-tour='timeline']",
    title: "Fotogramas clave en la línea de tiempo",
    description:
      "Haz clic en la flecha de expandir de una pista para ver las subpistas de fotogramas clave. Arrastra los rombos para ajustar el timing.",
    tips: [
      "Los rombos marcan la posición de cada fotograma clave",
      "Arrastra horizontalmente para cambiar el timing",
      "Haz clic en la curva entre fotogramas clave para editar el easing",
    ],
    position: "top",
  },
  {
    id: "keyframe-editor",
    target: "[data-tour='toolbar']",
    title: "Editor de curvas",
    description:
      "Abre el editor de fotogramas clave desde la barra de herramientas para un control preciso. Edita curvas, copia/pega fotogramas clave y afina animaciones.",
    tips: [
      "Arrastra los puntos para ajustar tiempo y valor",
      "Selecciona varios fotogramas clave con Shift+clic",
      "Aplica presets de easing a los fotogramas seleccionados",
    ],
    position: "bottom",
  },
  {
    id: "motion-path",
    target: "[data-tour='preview']",
    title: "Rutas de movimiento",
    description:
      "Crea movimientos suaves sobre rutas personalizadas. Activa el modo de ruta para dibujar curvas bézier directamente sobre la vista previa.",
    tips: [
      "Haz clic en el lienzo para agregar puntos a la ruta",
      "Arrastra los manejadores para curvar la ruta",
      "Los elementos siguen la ruta al animarse",
      "Ideal para logos voladores y texto dinámico",
    ],
    position: "left",
  },
  {
    id: "particle-effects",
    target: "[data-tour='inspector']",
    title: "Efectos de partículas",
    description:
      "Agrega efectos de partículas cinematográficos: confeti, destellos, polvo y explosiones. Están en la sección de partículas del Inspector.",
    tips: [
      "Elige efectos predefinidos o personalízalos",
      "Ajusta cantidad, velocidad y colores de partículas",
      "Define cuándo aparecen los efectos",
      "Combínalos con fotogramas clave para revelados dramáticos",
    ],
    position: "left",
  },
  {
    id: "emphasis-animations",
    target: "[data-tour='inspector']",
    title: "Animaciones de énfasis",
    description:
      "Haz que los elementos destaquen con animaciones llamativas. Pulso, rebote, sacudida y más: perfectas para resaltar contenido importante.",
    tips: [
      "24 presets de énfasis integrados",
      "Define duración y repeticiones",
      "Combínalas con animaciones de entrada/salida",
    ],
    position: "left",
  },
  {
    id: "text-animations",
    target: "[data-tour='inspector']",
    title: "Presets de animación de texto",
    description:
      "Anima texto con presets profesionales. Los caracteres pueden aparecer con fundido, deslizarse, rebotar o escribirse a máquina.",
    tips: [
      "19 estilos de animación de texto disponibles",
      "Animación por carácter o por palabra",
      "Personaliza timing y easing",
    ],
    position: "left",
  },
  {
    id: "complete",
    target: null,
    title: "¡A animar!",
    description:
      "Ya puedes crear motion graphics profesionales. Selecciona un clip y experimenta con fotogramas clave y efectos.",
    tips: [
      "Presiona K para agregar un fotograma clave en el cursor",
      "Usa ? para ver todos los atajos de teclado",
      "Combina efectos para animaciones únicas",
    ],
    position: "center",
  },
];

export const MOGRAPH_TOUR_KEY = "openreel-mograph-tour-complete";
