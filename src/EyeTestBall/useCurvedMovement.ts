import { useCurrentFrame } from "remotion";

export interface MovementKeyframe {
  x: number;
  y: number;
  frame: number;
  curve?: number; // amplitude of the curve
}

/**
 * Returns the current position (x, y) for a character moving along a curved path defined by keyframes.
 * Each segment can have its own curve amplitude.
 */
export function useCurvedMovement(keyframes: MovementKeyframe[]): {
  x: number;
  y: number;
} {
  const frame = useCurrentFrame();
  if (keyframes.length === 0) return { x: 0, y: 0 };
  if (keyframes.length === 1) return { x: keyframes[0].x, y: keyframes[0].y };

  // Find which segment we're in
  let segIdx = 0;
  for (let i = 1; i < keyframes.length; i++) {
    if (frame < keyframes[i].frame) {
      segIdx = i - 1;
      break;
    }
    segIdx = i;
  }

  // If after last keyframe, stay at last
  if (segIdx === keyframes.length - 1) {
    return { x: keyframes[segIdx].x, y: keyframes[segIdx].y };
  }

  const start = keyframes[segIdx];
  const end = keyframes[segIdx + 1];
  const duration = end.frame - start.frame;
  const localFrame = Math.max(0, Math.min(frame - start.frame, duration));
  const progress = duration === 0 ? 1 : localFrame / duration;

  // Linear interpolation
  const x = start.x + (end.x - start.x) * progress;
  let y = start.y + (end.y - start.y) * progress;

  // Curve amplitude (default 0)
  const amplitude = start.curve ?? 0;
  if (amplitude !== 0) {
    y -= Math.sin(progress * Math.PI) * amplitude;
  }

  return { x, y };
}
