import React, { useCallback, useMemo, useRef } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Crosshair,
  Bold,
  Italic,
  Underline,
  Type,
  Upload,
} from "lucide-react";
import { useProjectStore } from "../../../stores/project-store";
import type { TextStyle, FontWeight } from "@openreel/core";
import {
  ColorPicker,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@openreel/ui";
import {
  FONT_CATEGORIES,
  FONT_FILE_ACCEPT,
  registerCustomFont,
  useCustomFonts,
} from "./font-options";
import { toast } from "../../../stores/notification-store";

const ColorField: React.FC<{
  label: string;
  value: string;
  onChange: (color: string) => void;
  showAlpha?: boolean;
  allowTransparent?: boolean;
}> = ({ label, value, onChange, showAlpha = false, allowTransparent = false }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[10px] text-text-secondary">{label}</span>
    <ColorPicker
      value={value}
      onChange={onChange}
      showAlpha={showAlpha}
      allowTransparent={allowTransparent}
      className="max-w-[170px]"
    />
  </div>
);

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min = 0, max = 1000, step = 1, unit = "" }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] text-text-secondary">{label}</span>
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-16 px-2 py-1 text-[10px] font-mono text-text-primary bg-background-tertiary border border-border rounded text-right outline-none focus:border-primary"
      />
      {unit && <span className="text-[10px] text-text-muted">{unit}</span>}
    </div>
  </div>
);

const ToggleButtonGroup: React.FC<{
  options: { value: string; icon: React.ReactNode; label: string }[];
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex gap-1">
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`p-1.5 rounded transition-colors ${
          value === option.value
            ? "bg-primary text-white"
            : "bg-background-tertiary border border-border text-text-secondary hover:text-text-primary"
        }`}
        title={option.label}
      >
        {option.icon}
      </button>
    ))}
  </div>
);

const FontSelector: React.FC<{
  value: string;
  onChange: (font: string) => void;
}> = ({ value, onChange }) => {
  const customFonts = useCustomFonts();
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-text-secondary">Fuente</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="max-w-[140px] bg-background-tertiary border-border text-text-primary text-[10px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background-secondary border-border max-h-80">
          {Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
            <SelectGroup key={category}>
              <SelectLabel className="text-text-muted text-[10px] font-medium">
                {category}
              </SelectLabel>
              {fonts.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          {customFonts.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-text-muted text-[10px] font-medium">
                Fuentes personalizadas
              </SelectLabel>
              {customFonts.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

interface TextSectionProps {
  clipId: string;
}

/**
 * TextSection Component
 *
 * - 15.1: Display text content editor and styling controls
 */
export const TextSection: React.FC<TextSectionProps> = ({ clipId }) => {
  const {
    getTextClip,
    updateTextContent,
    updateTextStyle,
    updateTextTransform,
    project,
  } = useProjectStore();
  const fontInputRef = useRef<HTMLInputElement>(null);

  const textClip = useMemo(
    () => getTextClip(clipId),
    [clipId, getTextClip, project.modifiedAt],
  );

  const defaultStyle: TextStyle = {
    fontFamily: "Inter",
    fontSize: 48,
    fontWeight: "normal" as FontWeight,
    fontStyle: "normal",
    color: "#ffffff",
    backgroundColor: "transparent",
    textAlign: "center",
    verticalAlign: "middle",
    lineHeight: 1.2,
    letterSpacing: 0,
    textDecoration: "none",
    strokeColor: "#000000",
    strokeWidth: 0,
    shadowColor: "#000000",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
  };

  const style = textClip?.style || defaultStyle;
  const text = textClip?.text || "";

  const handleTextChange = useCallback(
    (newText: string) => {
      updateTextContent(clipId, newText);
    },
    [clipId, updateTextContent],
  );

  const handleStyleChange = useCallback(
    async (changes: Partial<TextStyle>) => {
      if (changes.fontFamily) {
        try {
          const fontSize = style.fontSize || 48;
          await document.fonts.load(`${fontSize}px "${changes.fontFamily}"`);
        } catch {
          // Font load failed, continue anyway - browser will fallback
        }
      }
      updateTextStyle(clipId, changes);
    },
    [clipId, updateTextStyle, style.fontSize],
  );

  const handleCenterHorizontal = useCallback(() => {
    const currentY = textClip?.transform?.position?.y ?? 0.5;
    updateTextTransform(clipId, { position: { x: 0.5, y: currentY } });
  }, [clipId, textClip, updateTextTransform]);

  const handleCenterVertical = useCallback(() => {
    const currentX = textClip?.transform?.position?.x ?? 0.5;
    updateTextTransform(clipId, { position: { x: currentX, y: 0.5 } });
  }, [clipId, textClip, updateTextTransform]);

  const handleCenterBoth = useCallback(() => {
    updateTextTransform(clipId, { position: { x: 0.5, y: 0.5 } });
  }, [clipId, updateTextTransform]);

  const handleCustomFontSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const result = await registerCustomFont(file);
      if (!result.success) {
        toast.error("Error al subir la fuente", result.error ?? "Error desconocido.");
      } else {
        await handleStyleChange({ fontFamily: result.fontFamily });
        toast.success("Fuente personalizada subida", `${result.fontFamily} está lista para usar.`);
      }

      event.target.value = "";
    },
    [handleStyleChange],
  );

  if (!textClip) {
    return (
      <div className="p-4 text-center">
        <Type size={24} className="mx-auto mb-2 text-text-muted" />
        <p className="text-[10px] text-text-muted">Ningún clip de texto seleccionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-[10px] text-text-secondary">Contenido de texto</span>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Escribe el texto..."
          className="w-full h-20 px-3 py-2 text-sm text-text-primary bg-background-tertiary border border-border rounded-lg resize-none outline-none focus:border-primary"
          style={{ fontFamily: style.fontFamily }}
        />
      </div>

      <div className="space-y-2 p-3 bg-background-tertiary rounded-lg">
        <input
          ref={fontInputRef}
          type="file"
          accept={FONT_FILE_ACCEPT}
          onChange={handleCustomFontSelect}
          className="hidden"
        />
        <FontSelector
          value={style.fontFamily}
          onChange={(fontFamily) => handleStyleChange({ fontFamily })}
        />
        <button
          onClick={() => fontInputRef.current?.click()}
          className="w-full py-1.5 px-2 bg-background-secondary border border-border rounded text-[10px] text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-1.5"
        >
          <Upload size={11} />
          Subir fuente personalizada
        </button>
        <NumberInput
          label="Tamaño"
          value={style.fontSize}
          onChange={(fontSize) => handleStyleChange({ fontSize })}
          min={8}
          max={500}
          unit="px"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-secondary">Estilo</span>
          <div className="flex gap-1">
            <button
              onClick={() =>
                handleStyleChange({
                  fontWeight: style.fontWeight === "bold" ? "normal" : "bold",
                })
              }
              className={`p-1.5 rounded transition-colors ${
                style.fontWeight === "bold"
                  ? "bg-primary text-white"
                  : "bg-background-secondary border border-border text-text-secondary hover:text-text-primary"
              }`}
              title="Negrita"
            >
              <Bold size={12} />
            </button>
            <button
              onClick={() =>
                handleStyleChange({
                  fontStyle: style.fontStyle === "italic" ? "normal" : "italic",
                })
              }
              className={`p-1.5 rounded transition-colors ${
                style.fontStyle === "italic"
                  ? "bg-primary text-white"
                  : "bg-background-secondary border border-border text-text-secondary hover:text-text-primary"
              }`}
              title="Cursiva"
            >
              <Italic size={12} />
            </button>
            <button
              onClick={() =>
                handleStyleChange({
                  textDecoration:
                    style.textDecoration === "underline" ? "none" : "underline",
                })
              }
              className={`p-1.5 rounded transition-colors ${
                style.textDecoration === "underline"
                  ? "bg-primary text-white"
                  : "bg-background-secondary border border-border text-text-secondary hover:text-text-primary"
              }`}
              title="Subrayado"
            >
              <Underline size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-secondary">Alineación</span>
        <ToggleButtonGroup
          options={[
            { value: "left", icon: <AlignLeft size={12} />, label: "Izquierda" },
            {
              value: "center",
              icon: <AlignCenter size={12} />,
              label: "Centro",
            },
            { value: "right", icon: <AlignRight size={12} />, label: "Derecha" },
          ]}
          value={style.textAlign}
          onChange={(textAlign) =>
            handleStyleChange({
              textAlign: textAlign as "left" | "center" | "right",
            })
          }
        />
      </div>

      <div className="space-y-2 p-3 bg-background-tertiary rounded-lg">
        <span className="text-[10px] text-text-secondary font-medium">
          Posición en el lienzo
        </span>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-muted">Alinear al lienzo</span>
          <div className="flex gap-1">
            <button
              onClick={handleCenterHorizontal}
              className="p-1.5 rounded bg-background-secondary border border-border text-text-secondary hover:text-text-primary transition-colors"
              title="Centrar horizontalmente"
            >
              <AlignHorizontalJustifyCenter size={12} />
            </button>
            <button
              onClick={handleCenterVertical}
              className="p-1.5 rounded bg-background-secondary border border-border text-text-secondary hover:text-text-primary transition-colors"
              title="Centrar verticalmente"
            >
              <AlignVerticalJustifyCenter size={12} />
            </button>
            <button
              onClick={handleCenterBoth}
              className="p-1.5 rounded bg-primary text-white transition-colors"
              title="Centrar en ambos ejes"
            >
              <Crosshair size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3 bg-background-tertiary rounded-lg">
        <ColorField
          label="Color del texto"
          value={style.color}
          onChange={(color) => handleStyleChange({ color })}
        />
        <ColorField
          label="Fondo"
          value={style.backgroundColor || "transparent"}
          onChange={(backgroundColor) => handleStyleChange({ backgroundColor })}
          showAlpha
          allowTransparent
        />
      </div>

      <div className="space-y-2 p-3 bg-background-tertiary rounded-lg">
        <span className="text-[10px] text-text-secondary font-medium">
          Borde
        </span>
        <ColorField
          label="Color"
          value={style.strokeColor || "#000000"}
          onChange={(strokeColor) => handleStyleChange({ strokeColor })}
        />
        <NumberInput
          label="Grosor"
          value={style.strokeWidth || 0}
          onChange={(strokeWidth) => handleStyleChange({ strokeWidth })}
          min={0}
          max={20}
          unit="px"
        />
      </div>

      <div className="space-y-2 p-3 bg-background-tertiary rounded-lg">
        <span className="text-[10px] text-text-secondary font-medium">
          Sombra
        </span>
        <ColorField
          label="Color"
          value={style.shadowColor || "#000000"}
          onChange={(shadowColor) => handleStyleChange({ shadowColor })}
          showAlpha
        />
        <NumberInput
          label="Desplazamiento X"
          value={style.shadowOffsetX || 0}
          onChange={(shadowOffsetX) => handleStyleChange({ shadowOffsetX })}
          min={-50}
          max={50}
          unit="px"
        />
        <NumberInput
          label="Desplazamiento Y"
          value={style.shadowOffsetY || 0}
          onChange={(shadowOffsetY) => handleStyleChange({ shadowOffsetY })}
          min={-50}
          max={50}
          unit="px"
        />
        <NumberInput
          label="Desenfoque"
          value={style.shadowBlur || 0}
          onChange={(shadowBlur) => handleStyleChange({ shadowBlur })}
          min={0}
          max={50}
          unit="px"
        />
      </div>

      <div className="space-y-2 p-3 bg-background-tertiary rounded-lg">
        <NumberInput
          label="Interlineado"
          value={style.lineHeight || 1.2}
          onChange={(lineHeight) => handleStyleChange({ lineHeight })}
          min={0.5}
          max={3}
          step={0.1}
        />
        <NumberInput
          label="Espaciado de letras"
          value={style.letterSpacing || 0}
          onChange={(letterSpacing) => handleStyleChange({ letterSpacing })}
          min={-10}
          max={50}
          unit="px"
        />
      </div>

      <Text3DControls clipId={clipId} />
    </div>
  );
};

// ─── 3D Text controls ─────────────────────────────────────────────

interface Text3DControlsProps {
  clipId: string;
}

type Text3DDefaults = {
  enabled: boolean;
  depth: number;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
  material: "basic" | "physical";
  metalness: number;
  roughness: number;
};

// Etiquetas visibles para materiales 3D (los valores internos no cambian)
const MATERIAL_LABELS: Record<"basic" | "physical", string> = {
  basic: "básico",
  physical: "físico",
};

const DEFAULT_TEXT_3D: Text3DDefaults = {
  enabled: true,
  depth: 12,
  bevelThickness: 1.5,
  bevelSize: 0.8,
  bevelSegments: 3,
  material: "physical",
  metalness: 0.4,
  roughness: 0.45,
};

const Text3DControls: React.FC<Text3DControlsProps> = ({ clipId }) => {
  const { getTextClip, updateText3D, project, updateClipRotate3D } = useProjectStore();
  const textClip = useMemo(
    () => getTextClip(clipId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clipId, getTextClip, project.modifiedAt],
  );
  const text3d = textClip?.text3d;
  const enabled = text3d?.enabled ?? false;

  const apply = useCallback(
    (changes: Partial<typeof DEFAULT_TEXT_3D>) => {
      const next = { ...(text3d ?? DEFAULT_TEXT_3D), ...changes };
      updateText3D(clipId, next);
    },
    [text3d, clipId, updateText3D],
  );

  return (
    <div className="space-y-2 p-3 bg-background-tertiary rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-primary font-medium">
          Texto 3D
        </span>
        <button
          onClick={() => {
            if (enabled) {
              // Toggle off — preserve other params for re-enable.
              apply({ enabled: false });
            } else {
              apply({ ...DEFAULT_TEXT_3D, enabled: true });
              // Nudge the rotation a touch so depth is visible by default
              const rot = textClip?.transform.rotate3d ?? { x: 0, y: 0, z: 0 };
              if (rot.x === 0 && rot.y === 0) {
                updateClipRotate3D(clipId, { x: -10, y: 18, z: 0 });
              }
            }
          }}
          className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
            enabled
              ? "bg-primary/20 border-primary text-primary"
              : "bg-background-tertiary border-border text-text-secondary hover:border-primary/50"
          }`}
        >
          {enabled ? "Activado" : "Desactivado"}
        </button>
      </div>
      {enabled && (
        <>
          <NumberInput
            label="Profundidad"
            value={text3d?.depth ?? DEFAULT_TEXT_3D.depth}
            onChange={(depth) => apply({ depth })}
            min={1}
            max={120}
            step={1}
            unit="px"
          />
          <NumberInput
            label="Grosor del bisel"
            value={text3d?.bevelThickness ?? DEFAULT_TEXT_3D.bevelThickness}
            onChange={(bevelThickness) => apply({ bevelThickness })}
            min={0}
            max={20}
            step={0.1}
          />
          <NumberInput
            label="Tamaño del bisel"
            value={text3d?.bevelSize ?? DEFAULT_TEXT_3D.bevelSize}
            onChange={(bevelSize) => apply({ bevelSize })}
            min={0}
            max={10}
            step={0.1}
          />
          <NumberInput
            label="Segmentos del bisel"
            value={text3d?.bevelSegments ?? DEFAULT_TEXT_3D.bevelSegments}
            onChange={(bevelSegments) => apply({ bevelSegments: Math.max(1, Math.round(bevelSegments)) })}
            min={1}
            max={8}
            step={1}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-secondary">Material</span>
            <div className="flex gap-1">
              {(["basic", "physical"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => apply({ material: m })}
                  className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                    (text3d?.material ?? "physical") === m
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-background-tertiary border-border text-text-secondary hover:border-primary/50"
                  }`}
                >
                  {MATERIAL_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          {(text3d?.material ?? "physical") === "physical" && (
            <>
              <NumberInput
                label="Metalizado"
                value={text3d?.metalness ?? DEFAULT_TEXT_3D.metalness}
                onChange={(metalness) => apply({ metalness: Math.max(0, Math.min(1, metalness)) })}
                min={0}
                max={1}
                step={0.05}
              />
              <NumberInput
                label="Rugosidad"
                value={text3d?.roughness ?? DEFAULT_TEXT_3D.roughness}
                onChange={(roughness) => apply({ roughness: Math.max(0, Math.min(1, roughness)) })}
                min={0}
                max={1}
                step={0.05}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TextSection;
