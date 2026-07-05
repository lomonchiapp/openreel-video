import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  Search,
  X,
  Video,
  Music2,
  Type,
  Palette,
  Wand2,
  Layers,
  Zap,
  Square,
  Move,
  Focus,
  Clock,
  Eye,
  Sliders,
} from "lucide-react";
import { Dialog, DialogContent, Input } from "@openreel/ui";
import { useUIStore } from "../../stores/ui-store";

interface SearchItem {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  icon: React.ElementType;
  description: string;
  sectionId: string;
  clipTypes: Array<"video" | "audio" | "text" | "shape" | "image">;
}

const SEARCHABLE_EFFECTS: SearchItem[] = [
  {
    id: "transform",
    name: "Transformar",
    category: "Position & Size",
    keywords: ["position", "scale", "rotate", "move", "resize", "transform"],
    icon: Move,
    description: "Posición, escala y rotación del clip",
    sectionId: "transform",
    clipTypes: ["video", "image", "text", "shape"],
  },
  {
    id: "crop",
    name: "Recorte",
    category: "Position & Size",
    keywords: ["crop", "cut", "trim", "frame", "aspect"],
    icon: Focus,
    description: "Recorta y encuadra el clip",
    sectionId: "crop",
    clipTypes: ["video", "image"],
  },
  {
    id: "speed",
    name: "Control de velocidad",
    category: "Time",
    keywords: ["speed", "slow", "fast", "time", "duration", "playback"],
    icon: Clock,
    description: "Controla la velocidad de reproducción y el remapeo de tiempo",
    sectionId: "speed",
    clipTypes: ["video", "audio"],
  },
  {
    id: "video-effects",
    name: "Efectos de video",
    category: "Video",
    keywords: [
      "brightness",
      "contrast",
      "saturation",
      "blur",
      "sharpen",
      "vignette",
      "effects",
    ],
    icon: Sliders,
    description: "Brillo, contraste, saturación, desenfoque, nitidez",
    sectionId: "video-effects",
    clipTypes: ["video", "image"],
  },
  {
    id: "color-grading",
    name: "Corrección de color",
    category: "Video",
    keywords: [
      "color",
      "grade",
      "wheels",
      "curves",
      "lut",
      "hsl",
      "exposure",
      "temperature",
    ],
    icon: Palette,
    description: "Ruedas de color, curvas, LUTs y ajustes HSL",
    sectionId: "color-grading",
    clipTypes: ["video", "image"],
  },
  {
    id: "green-screen",
    name: "Pantalla verde",
    category: "Video",
    keywords: ["green", "screen", "chroma", "key", "background", "remove"],
    icon: Eye,
    description: "Chroma key para eliminar fondos verdes o azules",
    sectionId: "green-screen",
    clipTypes: ["video", "image"],
  },
  {
    id: "background-removal",
    name: "Quitar fondo",
    category: "Video",
    keywords: ["background", "remove", "ai", "mask", "cutout", "person"],
    icon: Wand2,
    description: "Eliminación de fondo con IA",
    sectionId: "background-removal",
    clipTypes: ["video", "image"],
  },
  {
    id: "masking",
    name: "Máscaras",
    category: "Video",
    keywords: ["mask", "shape", "feather", "reveal", "hide", "vignette"],
    icon: Layers,
    description: "Máscaras de forma para revelar u ocultar áreas",
    sectionId: "masking",
    clipTypes: ["video", "image"],
  },
  {
    id: "motion-tracking",
    name: "Seguimiento de movimiento",
    category: "Video",
    keywords: ["motion", "track", "follow", "pin", "stabilize"],
    icon: Move,
    description: "Rastrea movimiento y ancla elementos",
    sectionId: "motion-tracking",
    clipTypes: ["video"],
  },
  {
    id: "pip",
    name: "Picture-in-Picture",
    category: "Video",
    keywords: ["pip", "picture", "overlay", "corner", "position"],
    icon: Square,
    description: "Posiciona clips como superposición picture-in-picture",
    sectionId: "pip",
    clipTypes: ["video", "image"],
  },
  {
    id: "blending",
    name: "Modo de fusión",
    category: "Video",
    keywords: ["blend", "mode", "multiply", "screen", "overlay", "opacity"],
    icon: Layers,
    description: "Modos de fusión y control de opacidad",
    sectionId: "blending",
    clipTypes: ["video", "image"],
  },
  {
    id: "transform-3d",
    name: "Transformación 3D",
    category: "Video",
    keywords: ["3d", "perspective", "rotate", "flip", "tilt"],
    icon: Move,
    description: "Rotación 3D y efectos de perspectiva",
    sectionId: "transform-3d",
    clipTypes: ["video", "image"],
  },
  {
    id: "keyframes",
    name: "Fotogramas clave",
    category: "Animation",
    keywords: ["keyframe", "animate", "animation", "ease", "interpolate"],
    icon: Zap,
    description: "Anima propiedades a lo largo del tiempo",
    sectionId: "keyframes",
    clipTypes: ["video", "image", "text", "shape"],
  },
  {
    id: "transitions",
    name: "Transiciones",
    category: "Animation",
    keywords: ["transition", "fade", "dissolve", "wipe", "slide"],
    icon: Zap,
    description: "Transiciones entre clips",
    sectionId: "transitions",
    clipTypes: ["video", "image"],
  },
  {
    id: "motion-presets",
    name: "Presets de movimiento",
    category: "Animation",
    keywords: ["motion", "preset", "zoom", "pan", "shake", "bounce"],
    icon: Zap,
    description: "Animaciones de movimiento predefinidas",
    sectionId: "motion-presets",
    clipTypes: ["video", "image"],
  },
  {
    id: "audio-effects",
    name: "Efectos de audio",
    category: "Audio",
    keywords: [
      "audio",
      "eq",
      "equalizer",
      "compressor",
      "reverb",
      "delay",
      "sound",
    ],
    icon: Music2,
    description: "EQ, compresor, reverb y más",
    sectionId: "audio-effects",
    clipTypes: ["audio", "video"],
  },
  {
    id: "audio-ducking",
    name: "Ducking de audio",
    category: "Audio",
    keywords: ["duck", "ducking", "voice", "music", "fade", "auto"],
    icon: Music2,
    description: "Atenúa la música bajo la voz automáticamente",
    sectionId: "audio-ducking",
    clipTypes: ["audio", "video"],
  },
  {
    id: "text-properties",
    name: "Propiedades de texto",
    category: "Text",
    keywords: ["text", "font", "size", "color", "style", "typography"],
    icon: Type,
    description: "Fuente, tamaño, color y estilo de texto",
    sectionId: "text-properties",
    clipTypes: ["text"],
  },
  {
    id: "text-animation",
    name: "Animación de texto",
    category: "Text",
    keywords: ["text", "animate", "typewriter", "fade", "slide", "bounce"],
    icon: Type,
    description: "Anima texto con presets",
    sectionId: "text-animation",
    clipTypes: ["text"],
  },
  {
    id: "shape-properties",
    name: "Propiedades de forma",
    category: "Shapes",
    keywords: ["shape", "fill", "stroke", "corner", "radius", "shadow"],
    icon: Square,
    description: "Relleno, borde y efectos de la forma",
    sectionId: "shape-properties",
    clipTypes: ["shape"],
  },
];

const CATEGORIES = [
  { id: "all", name: "Todo" },
  { id: "video", name: "Video", icon: Video },
  { id: "audio", name: "Audio", icon: Music2 },
  { id: "text", name: "Texto", icon: Type },
  { id: "animation", name: "Animación", icon: Zap },
];

// Display labels for internal category values (kept in English for filter logic)
const CATEGORY_LABELS: Record<string, string> = {
  "Position & Size": "Posición y tamaño",
  Time: "Tiempo",
  Video: "Video",
  Audio: "Audio",
  Animation: "Animación",
  Text: "Texto",
  Shapes: "Formas",
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { selectedItems, setPanelVisible } = useUIStore();

  const selectedClipType = useMemo(() => {
    const clipItem = selectedItems.find(
      (item) =>
        item.type === "clip" ||
        item.type === "text-clip" ||
        item.type === "shape-clip",
    );
    if (!clipItem) return null;
    if (clipItem.type === "text-clip") return "text";
    if (clipItem.type === "shape-clip") return "shape";
    return "video";
  }, [selectedItems]);

  const filteredEffects = useMemo(() => {
    let effects = SEARCHABLE_EFFECTS;

    if (selectedClipType) {
      effects = effects.filter((e) =>
        e.clipTypes.includes(
          selectedClipType as "video" | "audio" | "text" | "shape" | "image",
        ),
      );
    }

    if (selectedCategory !== "all") {
      effects = effects.filter((e) =>
        e.category.toLowerCase().includes(selectedCategory.toLowerCase()),
      );
    }

    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(" ");
      effects = effects.filter((e) => {
        const searchText = [e.name, e.description, ...e.keywords, e.category]
          .join(" ")
          .toLowerCase();
        return searchTerms.every((term) => searchText.includes(term));
      });
    }

    return effects;
  }, [query, selectedCategory, selectedClipType]);

  const handleSelect = useCallback(
    (effect: SearchItem) => {
      setPanelVisible("inspector", true);

      setTimeout(() => {
        const sectionElement = document.querySelector(
          `[data-section-id="${effect.sectionId}"]`,
        );
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });

          const button = sectionElement.querySelector("button");
          if (button) {
            button.click();
          }

          sectionElement.classList.add(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
          setTimeout(() => {
            sectionElement.classList.remove(
              "ring-2",
              "ring-primary",
              "ring-offset-2",
            );
          }, 2000);
        }
      }, 100);

      onClose();
    },
    [onClose, setPanelVisible],
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredEffects.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filteredEffects[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredEffects[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredEffects, selectedIndex, handleSelect]);

  useEffect(() => {
    if (listRef.current && filteredEffects[selectedIndex]) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedIndex, filteredEffects]);

  if (!isOpen) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 top-[15vh] translate-y-0 bg-background-secondary border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-text-muted" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selectedClipType
                ? `Buscar efectos para clips de ${{ text: "texto", shape: "forma", video: "video" }[selectedClipType]}...`
                : "Buscar efectos y herramientas..."
            }
            className="flex-1 bg-transparent border-0 text-text-primary focus-visible:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded hover:bg-background-tertiary text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-background-tertiary border border-border">
            <span className="text-[10px] text-text-muted">ESC</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background-tertiary/50">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-elevated"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {filteredEffects.length === 0 ? (
            <div className="py-12 text-center">
              <Search
                size={32}
                className="mx-auto mb-3 text-text-muted opacity-50"
              />
              <p className="text-sm text-text-muted">No se encontraron efectos</p>
              <p className="text-xs text-text-muted mt-1">
                Prueba con otro término u otra categoría
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredEffects.map((effect, index) => {
                const Icon = effect.icon;
                return (
                  <button
                    key={effect.id}
                    onClick={() => handleSelect(effect)}
                    className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all ${
                      index === selectedIndex
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "hover:bg-background-tertiary border-l-2 border-transparent"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        index === selectedIndex
                          ? "bg-primary text-white"
                          : "bg-background-tertiary text-text-secondary"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            index === selectedIndex
                              ? "text-primary"
                              : "text-text-primary"
                          }`}
                        >
                          {effect.name}
                        </span>
                        <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-background-tertiary">
                          {CATEGORY_LABELS[effect.category] ?? effect.category}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {effect.description}
                      </p>
                    </div>
                    <div className="text-[10px] text-text-muted">
                      ↵ para elegir
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-background-tertiary/50 flex items-center justify-between">
          <div className="text-[10px] text-text-muted">
            {filteredEffects.length} efecto
            {filteredEffects.length !== 1 ? "s" : ""} disponible
            {filteredEffects.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-text-muted">
            <span>↑↓ Navegar</span>
            <span>↵ Elegir</span>
            <span>ESC Cerrar</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
