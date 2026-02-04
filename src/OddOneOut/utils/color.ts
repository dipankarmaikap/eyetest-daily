import { random } from "remotion";

export const hsl = (h: number, s = 70, l = 55) => `hsl(${h}, ${s}%, ${l}%)`;

export const randomInt = (min: number, max: number, seed: string | number) =>
  Math.floor(random(seed) * (max - min + 1)) + min;
