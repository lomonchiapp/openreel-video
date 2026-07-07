// @vitest-environment jsdom
// packages/core corre en entorno "node" por defecto (vitest.config.ts), pero
// video-engine.ts importa transitivamente parallel-frame-decoder.ts ->
// decode-worker.ts, que referencia `self` (global de Web Worker) a nivel de
// modulo — revienta en "node" puro aunque getAnimatedTransform en si no
// use nada de eso. jsdom expone `self`, alcanza sin mockear WebCodecs/WASM.
import { describe, it, expect } from "vitest";
import { VideoEngine } from "./video-engine";
import type { Clip, Keyframe, Transform } from "../types/timeline";

// getAnimatedTransform es un metodo privado de VideoEngine (la ruta real de
// render del EXPORT, ver createClipRenderInfo) — accedido via `as any` a
// proposito, mismo patron aceptado que usan otros tests del repo para
// ejercitar logica interna sin exponerla en la API publica. No requiere
// engine.initialize() (WebCodecs/WASM/mediabunny): getAnimatedTransform solo
// lee clip.transform + clip.keyframes via keyframeEngine, sin tocar ningun
// estado que dependa de inicializacion.
function getAnimatedTransform(
  engine: VideoEngine,
  clip: Clip,
  localTime: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Transform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (engine as any).getAnimatedTransform(clip, localTime);
}

const baseTransform: Transform = {
  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  rotation: 0,
  anchor: { x: 0.5, y: 0.5 },
  opacity: 1,
};

function makeClip(overrides: Partial<Clip> = {}): Clip {
  return {
    id: "clip-1",
    mediaId: "media-1",
    trackId: "track-1",
    startTime: 0,
    duration: 5,
    inPoint: 0,
    outPoint: 5,
    effects: [],
    audioEffects: [],
    transform: baseTransform,
    volume: 1,
    keyframes: [],
    ...overrides,
  };
}

describe("VideoEngine.getAnimatedTransform (export)", () => {
  const engine = new VideoEngine();

  it("devuelve transform base cuando no hay keyframes", () => {
    const clip = makeClip();
    const result = getAnimatedTransform(engine, clip, 2.5);
    expect(result).toEqual(baseTransform);
  });

  it("interpola position/scale/rotation/opacity igual que el preview", () => {
    const keyframes: Keyframe[] = [
      { id: "1", property: "position.x", time: 0, value: 0, easing: "linear" },
      { id: "2", property: "position.x", time: 1, value: 200, easing: "linear" },
      { id: "3", property: "opacity", time: 0, value: 1, easing: "linear" },
      { id: "4", property: "opacity", time: 1, value: 0, easing: "linear" },
    ];
    const clip = makeClip({ keyframes });
    const result = getAnimatedTransform(engine, clip, 0.5);
    expect(result.position.x).toBeCloseTo(100, 5);
    expect(result.opacity).toBeCloseTo(0.5, 5);
  });

  describe("crop-path keyframes", () => {
    it("interpola crop.x/y/width/height con default de frame completo (sin recorte)", () => {
      const keyframes: Keyframe[] = [
        { id: "1", property: "crop.x", time: 0, value: 0, easing: "linear" },
        { id: "2", property: "crop.x", time: 2, value: 0.4, easing: "linear" },
        { id: "3", property: "crop.height", time: 0, value: 1, easing: "linear" },
        { id: "4", property: "crop.height", time: 2, value: 0.5, easing: "linear" },
      ];
      const clip = makeClip({ keyframes });
      const result = getAnimatedTransform(engine, clip, 1);
      expect(result.crop?.x).toBeCloseTo(0.2, 5);
      expect(result.crop?.height).toBeCloseTo(0.75, 5);
      expect(result.crop?.y).toBe(0);
      expect(result.crop?.width).toBe(1);
    });

    it("sin keyframes de crop, exporta crop.base tal cual (regresion del bug encontrado: antes SIEMPRE ignoraba los keyframes de crop)", () => {
      const clip = makeClip({
        transform: { ...baseTransform, crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } },
        keyframes: [
          { id: "1", property: "position.x", time: 0, value: 0, easing: "linear" },
          { id: "2", property: "position.x", time: 1, value: 50, easing: "linear" },
        ],
      });
      const result = getAnimatedTransform(engine, clip, 0.5);
      expect(result.crop).toEqual({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
    });

    it("parte del crop base existente para los ejes sin keyframe propio", () => {
      const clip = makeClip({
        transform: { ...baseTransform, crop: { x: 0.2, y: 0.3, width: 0.5, height: 0.5 } },
        keyframes: [
          { id: "1", property: "crop.x", time: 0, value: 0.2, easing: "linear" },
          { id: "2", property: "crop.x", time: 1, value: 0.6, easing: "linear" },
        ],
      });
      const result = getAnimatedTransform(engine, clip, 0.5);
      expect(result.crop?.x).toBeCloseTo(0.4, 5);
      expect(result.crop?.y).toBe(0.3);
      expect(result.crop?.width).toBe(0.5);
      expect(result.crop?.height).toBe(0.5);
    });
  });
});
