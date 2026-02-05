/**
 * Simple utility functions for Ishihara plate generation
 */

export interface Dot {
  x: number;
  y: number;
  radius: number;
}

/**
 * Check if two circles overlap (with padding)
 */
export function doCirclesOverlap(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  padding: number = 2,
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2 + padding;
}

/**
 * Simple segment-based digit definitions
 * Each digit is defined by rectangles (x, y, width, height) normalized to 0-1 range
 * Using medium segments for balanced visibility
 */
const DIGIT_SEGMENTS: Record<
  string,
  { x: number; y: number; w: number; h: number }[]
> = {
  "0": [
    { x: 0.15, y: 0, w: 0.7, h: 0.18 }, // top bar
    { x: 0.15, y: 0.82, w: 0.7, h: 0.18 }, // bottom bar
    { x: 0, y: 0, w: 0.3, h: 1 }, // left bar
    { x: 0.7, y: 0, w: 0.3, h: 1 }, // right bar
  ],
  "1": [
    { x: 0.3, y: 0, w: 0.4, h: 1 }, // main vertical
    { x: 0.1, y: 0.82, w: 0.8, h: 0.18 }, // base
  ],
  "2": [
    { x: 0, y: 0, w: 1, h: 0.18 }, // top
    { x: 0.7, y: 0, w: 0.3, h: 0.55 }, // top-right
    { x: 0, y: 0.41, w: 1, h: 0.18 }, // middle
    { x: 0, y: 0.45, w: 0.3, h: 0.55 }, // bottom-left
    { x: 0, y: 0.82, w: 1, h: 0.18 }, // bottom
  ],
  "3": [
    { x: 0, y: 0, w: 1, h: 0.18 }, // top
    { x: 0.7, y: 0, w: 0.3, h: 1 }, // right full
    { x: 0.25, y: 0.41, w: 0.75, h: 0.18 }, // middle
    { x: 0, y: 0.82, w: 1, h: 0.18 }, // bottom
  ],
  "4": [
    { x: 0, y: 0, w: 0.3, h: 0.59 }, // top-left
    { x: 0, y: 0.41, w: 1, h: 0.18 }, // horizontal bar
    { x: 0.7, y: 0, w: 0.3, h: 1 }, // right vertical
  ],
  "5": [
    { x: 0, y: 0, w: 1, h: 0.18 }, // top
    { x: 0, y: 0, w: 0.3, h: 0.59 }, // top-left
    { x: 0, y: 0.41, w: 1, h: 0.18 }, // middle
    { x: 0.7, y: 0.41, w: 0.3, h: 0.59 }, // bottom-right
    { x: 0, y: 0.82, w: 1, h: 0.18 }, // bottom
  ],
  "6": [
    { x: 0.15, y: 0, w: 0.85, h: 0.18 }, // top
    { x: 0, y: 0, w: 0.3, h: 1 }, // left full
    { x: 0.15, y: 0.82, w: 0.85, h: 0.18 }, // bottom
    { x: 0.7, y: 0.41, w: 0.3, h: 0.59 }, // bottom-right
    { x: 0.15, y: 0.41, w: 0.85, h: 0.18 }, // middle
  ],
  "7": [
    { x: 0, y: 0, w: 1, h: 0.18 }, // top
    { x: 0.7, y: 0, w: 0.3, h: 1 }, // right vertical
  ],
  "8": [
    { x: 0.15, y: 0, w: 0.7, h: 0.18 }, // top
    { x: 0, y: 0, w: 0.3, h: 0.55 }, // top-left
    { x: 0.7, y: 0, w: 0.3, h: 0.55 }, // top-right
    { x: 0.15, y: 0.41, w: 0.7, h: 0.18 }, // middle
    { x: 0, y: 0.45, w: 0.3, h: 0.55 }, // bottom-left
    { x: 0.7, y: 0.45, w: 0.3, h: 0.55 }, // bottom-right
    { x: 0.15, y: 0.82, w: 0.7, h: 0.18 }, // bottom
  ],
  "9": [
    { x: 0.15, y: 0, w: 0.7, h: 0.18 }, // top
    { x: 0, y: 0, w: 0.3, h: 0.59 }, // top-left
    { x: 0.7, y: 0, w: 0.3, h: 1 }, // right full
    { x: 0.15, y: 0.41, w: 0.7, h: 0.18 }, // middle
    { x: 0.15, y: 0.82, w: 0.85, h: 0.18 }, // bottom
  ],
};

/**
 * Check if a point is inside a digit using segment-based detection
 */
function isPointInDigit(
  x: number,
  y: number,
  digitX: number,
  digitY: number,
  digitWidth: number,
  digitHeight: number,
  digit: string,
): boolean {
  const segments = DIGIT_SEGMENTS[digit];
  if (!segments) return false;

  // Normalize point to digit's local coordinate system (0-1)
  const localX = (x - digitX) / digitWidth;
  const localY = (y - digitY) / digitHeight;

  // Check if point is outside digit bounding box
  if (localX < 0 || localX > 1 || localY < 0 || localY > 1) {
    return false;
  }

  // Check if point is inside any segment
  for (const seg of segments) {
    if (
      localX >= seg.x &&
      localX <= seg.x + seg.w &&
      localY >= seg.y &&
      localY <= seg.y + seg.h
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a point is inside the text (number) path
 * Uses simple segment-based detection for clean, recognizable digits
 */
export function isPointInTextPath(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  centerX: number,
  centerY: number,
): boolean {
  const digits = text.split("");
  const digitWidth = fontSize * 0.6;
  const digitHeight = fontSize;
  const totalWidth =
    digits.length * digitWidth + (digits.length - 1) * (digitWidth * 0.15);

  const startX = centerX - totalWidth / 2;
  const startY = centerY - digitHeight / 2;

  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    const digitX = startX + i * (digitWidth + digitWidth * 0.15);

    if (isPointInDigit(x, y, digitX, startY, digitWidth, digitHeight, digit)) {
      return true;
    }
  }

  return false;
}

export interface GenerateDotsParams {
  centerX: number;
  centerY: number;
  plateRadius: number;
  dotCount: number;
  minRadius: number;
  maxRadius: number;
  random: () => number;
  minGap?: number;
}

/**
 * Generate random dots inside a circle with collision avoidance
 * Uses a spatial grid for efficient O(1) collision detection
 */
export function generateDotsInCircle({
  centerX,
  centerY,
  plateRadius,
  dotCount,
  minRadius,
  maxRadius,
  random,
  minGap = 2,
}: GenerateDotsParams): Dot[] {
  const dots: Dot[] = [];
  const maxAttempts = dotCount * 30;
  let attempts = 0;

  // Keep dots fully inside the circle
  const effectiveRadius = plateRadius - maxRadius - 5;

  // Spatial grid for efficient collision detection
  const cellSize = maxRadius * 2 + minGap;
  const grid: Map<string, Dot[]> = new Map();

  const getCellKey = (x: number, y: number): string => {
    const cellX = Math.floor((x - centerX + plateRadius) / cellSize);
    const cellY = Math.floor((y - centerY + plateRadius) / cellSize);
    return `${cellX},${cellY}`;
  };

  const getNearbyCells = (x: number, y: number): string[] => {
    const cellX = Math.floor((x - centerX + plateRadius) / cellSize);
    const cellY = Math.floor((y - centerY + plateRadius) / cellSize);
    const keys: string[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        keys.push(`${cellX + dx},${cellY + dy}`);
      }
    }
    return keys;
  };

  while (dots.length < dotCount && attempts < maxAttempts) {
    attempts++;

    // Generate random point using polar coordinates (uniform distribution)
    const angle = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * effectiveRadius;

    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);

    // Random radius
    const radius = minRadius + random() * (maxRadius - minRadius);

    // Check for collisions
    let overlaps = false;
    const nearbyCells = getNearbyCells(x, y);

    for (const cellKey of nearbyCells) {
      const cellDots = grid.get(cellKey);
      if (cellDots) {
        for (const dot of cellDots) {
          if (
            doCirclesOverlap(x, y, radius, dot.x, dot.y, dot.radius, minGap)
          ) {
            overlaps = true;
            break;
          }
        }
      }
      if (overlaps) break;
    }

    if (!overlaps) {
      const newDot = { x, y, radius };
      dots.push(newDot);

      // Add to spatial grid
      const cellKey = getCellKey(x, y);
      if (!grid.has(cellKey)) {
        grid.set(cellKey, []);
      }
      grid.get(cellKey)!.push(newDot);
    }
  }

  return dots;
}
