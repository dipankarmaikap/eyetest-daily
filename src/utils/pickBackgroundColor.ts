import { createSeededRandom } from "./seededRandom";
import { solidPastels } from "./solidPastels";

export const pickBackgroundColor = (seed: number) => {
  const rand = createSeededRandom(seed);
  return solidPastels[Math.floor(rand() * solidPastels.length)];
};
