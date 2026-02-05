import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { createSeededRandom } from "../utils/seededRandom";
import { isPointInTextPath, generateDotsInCircle, Dot } from "./utils";

export interface IshiharaProps {
  /** The number to display (e.g., "12", "74") */
  number?: string;
  /** Size of the circular plate in pixels */
  size?: number;
  /** Number of dots to generate */
  dotCount?: number;
  /** Seed for deterministic random generation */
  seed?: number;
  /** Color for dots inside the number */
  numberColor?: string;
  /** Color for dots outside the number */
  backgroundColor?: string;
  /** Minimum dot radius */
  minRadius?: number;
  /** Maximum dot radius */
  maxRadius?: number;
}

export const Ishihara: React.FC<IshiharaProps> = ({
  number = "12",
  size = 700,
  dotCount = 800,
  seed = 42,
  numberColor = "#E85D04",
  backgroundColor = "#2D6A4F",
  minRadius = 6,
  maxRadius = 14,
}) => {
  const plateRadius = size / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Generate all dots deterministically
  const dots = useMemo(() => {
    const random = createSeededRandom(seed);
    return generateDotsInCircle({
      centerX,
      centerY,
      plateRadius,
      dotCount,
      minRadius,
      maxRadius,
      random,
    });
  }, [seed, centerX, centerY, plateRadius, dotCount, minRadius, maxRadius]);

  // Classify dots as inside or outside the number
  const classifiedDots = useMemo(() => {
    const fontSize = size * 0.55;
    return dots.map((dot: Dot) => ({
      ...dot,
      isInsideNumber: isPointInTextPath(
        dot.x,
        dot.y,
        number,
        fontSize,
        centerX,
        centerY,
      ),
    }));
  }, [dots, number, size, centerX, centerY]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDF0D5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle (plate) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={plateRadius - 2}
          fill="#F5E6D3"
          stroke="#D4C4B0"
          strokeWidth={4}
        />

        {/* Render all dots */}
        {classifiedDots.map((dot, index) => (
          <circle
            key={`dot-${index}`}
            cx={dot.x}
            cy={dot.y}
            r={dot.radius}
            fill={dot.isInsideNumber ? numberColor : backgroundColor}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
