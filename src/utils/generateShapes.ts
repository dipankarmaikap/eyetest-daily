import { createSeededRandom } from "./seededRandom";

/* =========================
   Types
========================= */

export type ShapeType = "circle" | "box" | "triangle" | "blob" | "abstract";

export type Shape = {
  type: ShapeType;
  size: number;
  x: number;
  y: number;
  blur: number;
  opacity: number;
  rotation: number;

  radius?: string;
  clipPath?: string;

  // animation params
  orbitRadius: number;
  orbitSpeed: number;
  phase: number;
};

/* =========================
   Helpers
========================= */

const spreadPosition = (index: number, count: number, rand: () => number) => {
  const cols = Math.ceil(Math.sqrt(count));
  const gap = 100 / cols;

  const x = (index % cols) * gap + rand() * gap;
  const y = Math.floor(index / cols) * gap + rand() * gap;

  return { x, y };
};

const randomTriangle = (rand: () => number): string =>
  `polygon(
    50% 0%,
    ${10 + rand() * 25}% ${75 + rand() * 15}%,
    ${65 + rand() * 25}% ${75 + rand() * 15}%
  )`;

const randomAbstract = (rand: () => number): string =>
  `polygon(
    ${rand() * 100}% ${rand() * 100}%,
    ${rand() * 100}% ${rand() * 100}%,
    ${rand() * 100}% ${rand() * 100}%,
    ${rand() * 100}% ${rand() * 100}%,
    ${rand() * 100}% ${rand() * 100}%
  )`;

/* =========================
   Generator
========================= */

export const generateShapes = (count: number, seed: number): Shape[] => {
  const rand = createSeededRandom(seed);
  const types: ShapeType[] = ["circle", "box", "triangle", "blob", "abstract"];

  return Array.from({ length: count }).map((_, i) => {
    const type = types[Math.floor(rand() * types.length)];
    const size = 260 + rand() * 440;
    const { x, y } = spreadPosition(i, count, rand);
    const orbitRadius = 20 + rand() * 80; // px
    const orbitSpeed = 0.5 + rand() * 1.5; // multiplier
    const phase = rand() * Math.PI * 2;

    const base: Shape = {
      type,
      size,
      x,
      y,
      blur: rand() > 0.6 ? Math.floor(rand() * 28) : 0,
      opacity: 0.15 + rand() * 0.25,
      rotation: rand() * 360,

      orbitRadius,
      orbitSpeed,
      phase,
    };

    switch (type) {
      case "circle":
        return {
          ...base,
          radius: "50%",
        };

      case "box":
        return {
          ...base,
          radius: `${8 + rand() * 20}px`,
        };

      case "triangle":
        return {
          ...base,
          clipPath: randomTriangle(rand),
        };

      case "abstract":
        return {
          ...base,
          clipPath: randomAbstract(rand),
        };

      case "blob":
      default:
        return {
          ...base,
          radius: `${30 + rand() * 40}% ${30 + rand() * 40}% ${
            30 + rand() * 40
          }% ${30 + rand() * 40}%`,
        };
    }
  });
};

/* =========================
   Rendering helper (optional)
========================= */

export const shapeStyle = (shape: Shape): React.CSSProperties => ({
  position: "absolute",
  width: shape.size,
  height: shape.size,
  left: `${shape.x}%`,
  top: `${shape.y}%`,
  transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
  filter: `blur(${shape.blur}px)`,
  opacity: shape.opacity,
  background: "currentColor",
  borderRadius: shape.radius,
  clipPath: shape.clipPath,
});
export const animatedShapeStyle = (
  shape: Shape,
  frame: number,
  durationInFrames: number,
): React.CSSProperties => {
  const t = (frame / durationInFrames) * Math.PI * 2;

  const dx = Math.cos(t * shape.orbitSpeed + shape.phase) * shape.orbitRadius;

  const dy = Math.sin(t * shape.orbitSpeed + shape.phase) * shape.orbitRadius;

  const rot = shape.rotation + Math.sin(t + shape.phase) * 15;

  return {
    position: "absolute",
    width: shape.size,
    height: shape.size,
    left: `${shape.x}%`,
    top: `${shape.y}%`,
    transform: `
      translate(-50%, -50%)
      translate(${dx}px, ${dy}px)
      rotate(${rot}deg)
    `,
    filter: `blur(${shape.blur}px)`,
    opacity: shape.opacity,
    background: "currentColor",
    borderRadius: shape.radius,
    clipPath: shape.clipPath,
    willChange: "transform",
  };
};
