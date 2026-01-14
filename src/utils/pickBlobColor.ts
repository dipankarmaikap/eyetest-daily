import { deepSolidColors } from "./deepSolidColors";
import { createSeededRandom } from "./seededRandom";

export const pickBlobColor = (seed: number) => {
  const rand = createSeededRandom(seed);
  return deepSolidColors[Math.floor(rand() * deepSolidColors.length)];
};
