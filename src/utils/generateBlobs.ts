import { createSeededRandom } from "./seededRandom";

export type Blob = {
  size: number;
  x: string;
  y: string;
  blur: number;
  opacity: number;
  radius: string;
};

export const generateBlobs = (count: number, seed: number): Blob[] => {
  const rand = createSeededRandom(seed);

  return Array.from({ length: count }).map(() => {
    const size = 300 + rand() * 500;

    const r1 = Math.floor(30 + rand() * 40);
    const r2 = Math.floor(30 + rand() * 40);
    const r3 = Math.floor(30 + rand() * 40);
    const r4 = Math.floor(30 + rand() * 40);

    return {
      size,
      x: `${rand() * 100}%`,
      y: `${rand() * 100}%`,
      blur: rand() > 0.5 ? Math.floor(rand() * 30) : 0,
      opacity: 0.15 + rand() * 0.25,
      radius: `${r1}% ${r2}% ${r3}% ${r4}%`,
    };
  });
};
