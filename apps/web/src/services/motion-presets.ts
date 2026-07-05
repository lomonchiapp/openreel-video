import { v4 as uuid } from "uuid";

export type PresetCategory = "entrance" | "exit" | "emphasis" | "transition";

export type AnimatableProperty =
  | "position"
  | "position.x"
  | "position.y"
  | "scale"
  | "scale.x"
  | "scale.y"
  | "rotation"
  | "opacity";

export type EasingFunction =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "ease-in-cubic"
  | "ease-out-cubic"
  | "ease-in-out-cubic"
  | "ease-out-back"
  | "ease-in-back";

export interface PresetKeyframe {
  time: number;
  value: number;
  easing?: EasingFunction;
}

export interface PresetPropertyTrack {
  property: AnimatableProperty;
  keyframes: PresetKeyframe[];
  relative?: boolean;
}

export interface MotionPreset {
  id: string;
  name: string;
  category: PresetCategory;
  description?: string;
  duration: number;
  tracks: PresetPropertyTrack[];
  tags?: string[];
}

export interface AppliedMotionPreset {
  id: string;
  presetId: string;
  clipId: string;
  startTime: number;
  duration: number;
  type: "in" | "out" | "emphasis";
}

const DB_NAME = "openreel-motion-presets";
const DB_VERSION = 1;
const STORE_NAME = "userPresets";

function openPresetDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

async function loadUserPresetsFromDB(): Promise<MotionPreset[]> {
  try {
    const db = await openPresetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function savePresetToDB(preset: MotionPreset): Promise<void> {
  try {
    const db = await openPresetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(preset);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    console.error("Failed to save preset to IndexedDB");
  }
}

async function deletePresetFromDB(presetId: string): Promise<void> {
  try {
    const db = await openPresetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(presetId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    console.error("Failed to delete preset from IndexedDB");
  }
}

const builtInPresets: MotionPreset[] = [
  {
    id: "fade-in",
    name: "Fundido de entrada",
    category: "entrance",
    description: "Fundido suave desde transparente",
    duration: 0.5,
    tags: ["simple", "opacity"],
    tracks: [
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0, easing: "ease-out" },
          { time: 0.5, value: 1 },
        ],
      },
    ],
  },
  {
    id: "slide-in-left",
    name: "Deslizar desde la izquierda",
    category: "entrance",
    description: "Entra deslizándose desde el borde izquierdo",
    duration: 0.6,
    tags: ["slide", "direction"],
    tracks: [
      {
        property: "position.x",
        keyframes: [
          { time: 0, value: -200, easing: "ease-out-cubic" },
          { time: 0.6, value: 0 },
        ],
        relative: true,
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.2, value: 1 },
        ],
      },
    ],
  },
  {
    id: "slide-in-right",
    name: "Deslizar desde la derecha",
    category: "entrance",
    description: "Entra deslizándose desde el borde derecho",
    duration: 0.6,
    tags: ["slide", "direction"],
    tracks: [
      {
        property: "position.x",
        keyframes: [
          { time: 0, value: 200, easing: "ease-out-cubic" },
          { time: 0.6, value: 0 },
        ],
        relative: true,
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.2, value: 1 },
        ],
      },
    ],
  },
  {
    id: "slide-in-top",
    name: "Deslizar desde arriba",
    category: "entrance",
    description: "Entra deslizándose desde el borde superior",
    duration: 0.6,
    tags: ["slide", "direction"],
    tracks: [
      {
        property: "position.y",
        keyframes: [
          { time: 0, value: -200, easing: "ease-out-cubic" },
          { time: 0.6, value: 0 },
        ],
        relative: true,
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.2, value: 1 },
        ],
      },
    ],
  },
  {
    id: "slide-in-bottom",
    name: "Deslizar desde abajo",
    category: "entrance",
    description: "Entra deslizándose desde el borde inferior",
    duration: 0.6,
    tags: ["slide", "direction"],
    tracks: [
      {
        property: "position.y",
        keyframes: [
          { time: 0, value: 200, easing: "ease-out-cubic" },
          { time: 0.6, value: 0 },
        ],
        relative: true,
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.2, value: 1 },
        ],
      },
    ],
  },
  {
    id: "scale-in",
    name: "Entrada con escala",
    category: "entrance",
    description: "Aparece con una animación de escala",
    duration: 0.4,
    tags: ["scale", "pop"],
    tracks: [
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 0, easing: "ease-out-back" },
          { time: 0.4, value: 1 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 0, easing: "ease-out-back" },
          { time: 0.4, value: 1 },
        ],
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.1, value: 1 },
        ],
      },
    ],
  },
  {
    id: "pop",
    name: "Pop",
    category: "entrance",
    description: "Entrada rápida con rebote de escala",
    duration: 0.3,
    tags: ["scale", "quick"],
    tracks: [
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 0.5, easing: "ease-out-back" },
          { time: 0.3, value: 1 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 0.5, easing: "ease-out-back" },
          { time: 0.3, value: 1 },
        ],
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.05, value: 1 },
        ],
      },
    ],
  },
  {
    id: "bounce-in",
    name: "Rebote de entrada",
    category: "entrance",
    description: "Entrada con escala rebotando",
    duration: 0.6,
    tags: ["bounce", "playful"],
    tracks: [
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.4, value: 1.15, easing: "ease-out" },
          { time: 0.5, value: 0.9 },
          { time: 0.6, value: 1 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.4, value: 1.15, easing: "ease-out" },
          { time: 0.5, value: 0.9 },
          { time: 0.6, value: 1 },
        ],
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.1, value: 1 },
        ],
      },
    ],
  },
  {
    id: "flip-in",
    name: "Giro de entrada",
    category: "entrance",
    description: "Efecto de entrada con giro 3D",
    duration: 0.5,
    tags: ["3d", "rotation"],
    tracks: [
      {
        property: "rotation",
        keyframes: [
          { time: 0, value: -90, easing: "ease-out" },
          { time: 0.5, value: 0 },
        ],
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.25, value: 1 },
        ],
      },
    ],
  },
  {
    id: "blur-in",
    name: "Desenfoque de entrada",
    category: "entrance",
    description: "Aparece con efecto de desenfoque",
    duration: 0.5,
    tags: ["blur", "soft"],
    tracks: [
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 0, easing: "ease-out" },
          { time: 0.5, value: 1 },
        ],
      },
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 1.1, easing: "ease-out" },
          { time: 0.5, value: 1 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 1.1, easing: "ease-out" },
          { time: 0.5, value: 1 },
        ],
      },
    ],
  },
  {
    id: "fade-out",
    name: "Fundido de salida",
    category: "exit",
    description: "Fundido suave hacia transparente",
    duration: 0.5,
    tags: ["simple", "opacity"],
    tracks: [
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in" },
          { time: 0.5, value: 0 },
        ],
      },
    ],
  },
  {
    id: "slide-out-left",
    name: "Deslizar hacia la izquierda",
    category: "exit",
    description: "Sale deslizándose por el borde izquierdo",
    duration: 0.6,
    tags: ["slide", "direction"],
    tracks: [
      {
        property: "position.x",
        keyframes: [
          { time: 0, value: 0, easing: "ease-in-cubic" },
          { time: 0.6, value: -200 },
        ],
        relative: true,
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0.4, value: 1 },
          { time: 0.6, value: 0 },
        ],
      },
    ],
  },
  {
    id: "slide-out-right",
    name: "Deslizar hacia la derecha",
    category: "exit",
    description: "Sale deslizándose por el borde derecho",
    duration: 0.6,
    tags: ["slide", "direction"],
    tracks: [
      {
        property: "position.x",
        keyframes: [
          { time: 0, value: 0, easing: "ease-in-cubic" },
          { time: 0.6, value: 200 },
        ],
        relative: true,
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0.4, value: 1 },
          { time: 0.6, value: 0 },
        ],
      },
    ],
  },
  {
    id: "scale-out",
    name: "Salida con escala",
    category: "exit",
    description: "Se encoge y se desvanece",
    duration: 0.4,
    tags: ["scale"],
    tracks: [
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in-back" },
          { time: 0.4, value: 0 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in-back" },
          { time: 0.4, value: 0 },
        ],
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0.3, value: 1 },
          { time: 0.4, value: 0 },
        ],
      },
    ],
  },
  {
    id: "shrink",
    name: "Encoger",
    category: "exit",
    description: "Salida rápida encogiéndose",
    duration: 0.3,
    tags: ["scale", "quick"],
    tracks: [
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in" },
          { time: 0.3, value: 0.5 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in" },
          { time: 0.3, value: 0.5 },
        ],
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 1 },
          { time: 0.3, value: 0 },
        ],
      },
    ],
  },
  {
    id: "blur-out",
    name: "Desenfoque de salida",
    category: "exit",
    description: "Se desvanece con efecto de desenfoque",
    duration: 0.5,
    tags: ["blur", "soft"],
    tracks: [
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in" },
          { time: 0.5, value: 0 },
        ],
      },
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in" },
          { time: 0.5, value: 1.1 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in" },
          { time: 0.5, value: 1.1 },
        ],
      },
    ],
  },
  {
    id: "pulse",
    name: "Pulso",
    category: "emphasis",
    description: "Efecto sutil de pulso de escala",
    duration: 0.8,
    tags: ["attention", "loop"],
    tracks: [
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in-out" },
          { time: 0.4, value: 1.1 },
          { time: 0.8, value: 1 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in-out" },
          { time: 0.4, value: 1.1 },
          { time: 0.8, value: 1 },
        ],
      },
    ],
  },
  {
    id: "shake",
    name: "Sacudida",
    category: "emphasis",
    description: "Sacudida horizontal rápida",
    duration: 0.5,
    tags: ["attention", "error"],
    tracks: [
      {
        property: "position.x",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.1, value: -10 },
          { time: 0.2, value: 10 },
          { time: 0.3, value: -10 },
          { time: 0.4, value: 10 },
          { time: 0.5, value: 0 },
        ],
        relative: true,
      },
    ],
  },
  {
    id: "bounce",
    name: "Rebote",
    category: "emphasis",
    description: "Efecto de rebote para llamar la atención",
    duration: 0.6,
    tags: ["attention", "playful"],
    tracks: [
      {
        property: "position.y",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.2, value: -20, easing: "ease-out" },
          { time: 0.4, value: 0, easing: "ease-in" },
          { time: 0.5, value: -10, easing: "ease-out" },
          { time: 0.6, value: 0, easing: "ease-in" },
        ],
        relative: true,
      },
    ],
  },
  {
    id: "wiggle",
    name: "Meneo",
    category: "emphasis",
    description: "Rotación juguetona de lado a lado",
    duration: 0.6,
    tags: ["attention", "playful"],
    tracks: [
      {
        property: "rotation",
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.1, value: -5 },
          { time: 0.2, value: 5 },
          { time: 0.3, value: -5 },
          { time: 0.4, value: 5 },
          { time: 0.5, value: -2 },
          { time: 0.6, value: 0 },
        ],
        relative: true,
      },
    ],
  },
  {
    id: "rubber-band",
    name: "Banda elástica",
    category: "emphasis",
    description: "Efecto de estiramiento elástico",
    duration: 0.6,
    tags: ["attention", "playful"],
    tracks: [
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 1 },
          { time: 0.2, value: 1.25 },
          { time: 0.35, value: 0.85 },
          { time: 0.5, value: 1.1 },
          { time: 0.6, value: 1 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 1 },
          { time: 0.2, value: 0.85 },
          { time: 0.35, value: 1.15 },
          { time: 0.5, value: 0.95 },
          { time: 0.6, value: 1 },
        ],
      },
    ],
  },
  {
    id: "glow-pulse",
    name: "Pulso de brillo",
    category: "emphasis",
    description: "Pulso sutil de opacidad",
    duration: 1,
    tags: ["attention", "subtle"],
    tracks: [
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in-out" },
          { time: 0.5, value: 0.7 },
          { time: 1, value: 1 },
        ],
      },
    ],
  },
  {
    id: "cross-dissolve",
    name: "Disolvencia cruzada",
    category: "transition",
    description: "Fundido cruzado simple de opacidad",
    duration: 0.5,
    tags: ["simple"],
    tracks: [
      {
        property: "opacity",
        keyframes: [
          { time: 0, value: 1, easing: "linear" },
          { time: 0.5, value: 0 },
        ],
      },
    ],
  },
  {
    id: "wipe-left",
    name: "Barrido a la izquierda",
    category: "transition",
    description: "Transición de barrido hacia la izquierda",
    duration: 0.5,
    tags: ["wipe", "direction"],
    tracks: [
      {
        property: "position.x",
        keyframes: [
          { time: 0, value: 0, easing: "ease-in-out" },
          { time: 0.5, value: -100 },
        ],
        relative: true,
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0.3, value: 1 },
          { time: 0.5, value: 0 },
        ],
      },
    ],
  },
  {
    id: "zoom-transition",
    name: "Transición de zoom",
    category: "transition",
    description: "Transición alejando el zoom",
    duration: 0.5,
    tags: ["zoom", "scale"],
    tracks: [
      {
        property: "scale.x",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in" },
          { time: 0.5, value: 1.5 },
        ],
      },
      {
        property: "scale.y",
        keyframes: [
          { time: 0, value: 1, easing: "ease-in" },
          { time: 0.5, value: 1.5 },
        ],
      },
      {
        property: "opacity",
        keyframes: [
          { time: 0.2, value: 1 },
          { time: 0.5, value: 0 },
        ],
      },
    ],
  },
];

let userPresets: MotionPreset[] = [];
let presetsInitialized = false;

export async function initializeUserPresets(): Promise<void> {
  if (presetsInitialized) return;
  try {
    userPresets = await loadUserPresetsFromDB();
    presetsInitialized = true;
  } catch {
    userPresets = [];
    presetsInitialized = true;
  }
}

initializeUserPresets();

export function loadMotionPreset(presetId: string): MotionPreset | null {
  const allPresets = [...builtInPresets, ...userPresets];
  return allPresets.find((p) => p.id === presetId) ?? null;
}

export function listAvailablePresets(): MotionPreset[] {
  return [...builtInPresets, ...userPresets];
}

export function listPresetsByCategory(
  category: PresetCategory,
): MotionPreset[] {
  return listAvailablePresets().filter((p) => p.category === category);
}

export function createUserPreset(
  name: string,
  category: PresetCategory,
  tracks: PresetPropertyTrack[],
  description?: string,
): MotionPreset {
  const preset: MotionPreset = {
    id: uuid(),
    name,
    category,
    description,
    duration: calculatePresetDuration(tracks),
    tracks,
    tags: ["custom"],
  };

  userPresets.push(preset);
  savePresetToDB(preset);
  return preset;
}

export function deleteUserPreset(presetId: string): boolean {
  const index = userPresets.findIndex((p) => p.id === presetId);
  if (index === -1) return false;
  userPresets.splice(index, 1);
  deletePresetFromDB(presetId);
  return true;
}

function calculatePresetDuration(tracks: PresetPropertyTrack[]): number {
  let maxDuration = 0;
  for (const track of tracks) {
    for (const kf of track.keyframes) {
      if (kf.time > maxDuration) maxDuration = kf.time;
    }
  }
  return maxDuration;
}

export function searchPresets(query: string): MotionPreset[] {
  const lowerQuery = query.toLowerCase();
  return listAvailablePresets().filter((preset) => {
    if (preset.name.toLowerCase().includes(lowerQuery)) return true;
    if (preset.description?.toLowerCase().includes(lowerQuery)) return true;
    if (preset.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)))
      return true;
    return false;
  });
}

export function getPresetLibrary(): {
  entrance: MotionPreset[];
  exit: MotionPreset[];
  emphasis: MotionPreset[];
  transition: MotionPreset[];
} {
  const allPresets = listAvailablePresets();
  return {
    entrance: allPresets.filter((p) => p.category === "entrance"),
    exit: allPresets.filter((p) => p.category === "exit"),
    emphasis: allPresets.filter((p) => p.category === "emphasis"),
    transition: allPresets.filter((p) => p.category === "transition"),
  };
}
