import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { createSeededRandom } from "../utils/seededRandom";
import { isPointInTextPath, generateDotsInCircle, Dot } from "./utils";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// Color schemes for Ishihara plates
// Each scheme has a base hue for background dots and a contrasting hue for number dots
const COLOR_SCHEMES = [
  { name: "green-red", bgHue: 140, numHueStart: 0, numHueEnd: 95 }, // Classic green/red
  { name: "blue-orange", bgHue: 210, numHueStart: 30, numHueEnd: 180 }, // Blue/orange
  { name: "purple-yellow", bgHue: 280, numHueStart: 50, numHueEnd: 260 }, // Purple/yellow
  { name: "teal-pink", bgHue: 175, numHueStart: 340, numHueEnd: 160 }, // Teal/pink
  { name: "olive-magenta", bgHue: 80, numHueStart: 320, numHueEnd: 70 }, // Olive/magenta
];

// Difficulty names based on progress (0-1)
const getDifficultyName = (progress: number): string => {
  if (progress < 0.2) return "EASY";
  if (progress < 0.4) return "MEDIUM";
  if (progress < 0.6) return "HARD";
  if (progress < 0.8) return "EXPERT";
  return "EXTREME";
};

// Get difficulty badge color based on progress
const getDifficultyColor = (progress: number): string => {
  if (progress < 0.2) return "#22c55e"; // Green
  if (progress < 0.4) return "#eab308"; // Yellow
  if (progress < 0.6) return "#f97316"; // Orange
  if (progress < 0.8) return "#ef4444"; // Red
  return "#ec4899"; // Pink
};

// Generate colors that transition from high contrast to low contrast
// Uses the provided color scheme
const generateColors = (
  progress: number,
  scheme: (typeof COLOR_SCHEMES)[number],
): { numberColor: string; bgColor: string } => {
  // Background dot color
  const bgSaturation = interpolate(progress, [0, 1], [65, 40]);
  const bgLightness = interpolate(progress, [0, 1], [35, 45]);

  // Number color transitions from contrasting to similar
  const numHue = interpolate(
    progress,
    [0, 1],
    [scheme.numHueStart, scheme.numHueEnd],
  );
  const numSaturation = interpolate(progress, [0, 1], [75, 45]);
  const numLightness = interpolate(progress, [0, 1], [50, 48]);

  return {
    numberColor: `hsl(${numHue}, ${numSaturation}%, ${numLightness}%)`,
    bgColor: `hsl(${scheme.bgHue}, ${bgSaturation}%, ${bgLightness}%)`,
  };
};

interface PuzzleLevel {
  number: string;
  startFrame: number;
  endFrame: number;
  duration: number;
  colorSchemeIndex: number;
}

export interface IshiharaVideoProps {
  /** Size of the circular plate */
  size?: number;
  /** Number of dots */
  dotCount?: number;
  /** Random seed - determines random numbers */
  seed?: number;
  /** Orientation: 'landscape' for YouTube, 'portrait' for shorts */
  orientation?: "landscape" | "portrait";
  /** Show countdown timer */
  showTimer?: boolean;
  /** Show difficulty label */
  showDifficulty?: boolean;
  /** Duration per puzzle in frames (default: 180 = 6 sec @ 30fps) */
  puzzleDuration?: number;
  /** Duration of intro screen in frames (default: 90 = 3 sec @ 30fps) */
  introDuration?: number;
}

export const IshiharaVideo: React.FC<IshiharaVideoProps> = ({
  size = 700,
  dotCount = 1500,
  seed = 42,
  orientation = "landscape",
  showTimer = true,
  showDifficulty = true,
  puzzleDuration = 180,
  introDuration = 90, // 3 seconds @ 30fps
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Check if we're in the intro phase
  const isIntroPhase = frame < introDuration;
  const gameFrame = Math.max(0, frame - introDuration); // Frame relative to game start
  const gameDuration = durationInFrames - introDuration;

  // Calculate number of puzzles based on game duration (excluding intro)
  const puzzleCount = useMemo(() => {
    return Math.max(1, Math.floor(gameDuration / puzzleDuration));
  }, [gameDuration, puzzleDuration]);

  // Generate puzzle levels with random numbers and color schemes
  const puzzleLevels = useMemo((): PuzzleLevel[] => {
    const levels: PuzzleLevel[] = [];
    const random = createSeededRandom(seed);

    for (let i = 0; i < puzzleCount; i++) {
      const startFrame = i * puzzleDuration;
      const endFrame = Math.min((i + 1) * puzzleDuration, gameDuration);
      const num = Math.floor(random() * 90) + 10; // 10-99
      const colorSchemeIndex = Math.floor(random() * COLOR_SCHEMES.length);

      levels.push({
        number: num.toString(),
        startFrame,
        endFrame,
        duration: endFrame - startFrame,
        colorSchemeIndex,
      });
    }
    return levels;
  }, [seed, puzzleCount, puzzleDuration, gameDuration]);

  // Find current puzzle level (based on gameFrame, not absolute frame)
  const currentPuzzleIndex = useMemo(() => {
    for (let i = 0; i < puzzleLevels.length; i++) {
      if (
        gameFrame >= puzzleLevels[i].startFrame &&
        gameFrame < puzzleLevels[i].endFrame
      ) {
        return i;
      }
    }
    return puzzleLevels.length - 1;
  }, [gameFrame, puzzleLevels]);

  const currentPuzzle = puzzleLevels[currentPuzzleIndex] || puzzleLevels[0];
  const frameInPuzzle = gameFrame - currentPuzzle.startFrame;

  // Overall progress (0 to 1) determines difficulty/colors - based on game time
  const overallProgress = useMemo(() => {
    return Math.min(gameFrame / gameDuration, 1);
  }, [gameFrame, gameDuration]);

  // Get colors based on overall progress and current puzzle's color scheme
  const { currentNumberColor, currentBgColor } = useMemo(() => {
    const scheme = COLOR_SCHEMES[currentPuzzle.colorSchemeIndex];
    const colors = generateColors(overallProgress, scheme);
    return {
      currentNumberColor: colors.numberColor,
      currentBgColor: colors.bgColor,
    };
  }, [overallProgress, currentPuzzle.colorSchemeIndex]);

  // Generate dots for current puzzle
  const plateRadius = size / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  const classifiedDots = useMemo(() => {
    // Use different seed for each puzzle to regenerate dots
    const dotSeed = seed + currentPuzzleIndex * 1000;
    const random = createSeededRandom(dotSeed);
    const dots = generateDotsInCircle({
      centerX,
      centerY,
      plateRadius,
      dotCount,
      minRadius: 6,
      maxRadius: 14,
      random,
    });

    const fontSize = size * 0.55;
    return dots.map((dot: Dot) => ({
      ...dot,
      isInsideNumber: isPointInTextPath(
        dot.x,
        dot.y,
        currentPuzzle.number,
        fontSize,
        centerX,
        centerY,
      ),
    }));
  }, [
    seed,
    currentPuzzleIndex,
    centerX,
    centerY,
    plateRadius,
    dotCount,
    currentPuzzle.number,
    size,
  ]);

  // Timer countdown for current puzzle
  const puzzleTimeRemaining = Math.max(
    0,
    Math.ceil((currentPuzzle.duration - frameInPuzzle) / fps),
  );

  // ===== INTRO SCREEN =====
  // Countdown "3, 2, 1"
  const countdownNumber = Math.ceil((introDuration - frame) / fps);

  // Intro fade out (last 15 frames of intro)
  const introFadeOut = interpolate(
    frame,
    [introDuration - 20, introDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ===== GAME SCREEN ANIMATIONS =====
  // Game content fade in (first 20 frames after intro)
  const gameContentFadeIn = spring({
    frame: gameFrame,
    fps,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: 25,
  });

  // Puzzle transition animation
  const puzzleTransition = spring({
    frame: frameInPuzzle,
    fps,
    config: { damping: 15, stiffness: 100 },
    durationInFrames: 20,
  });

  const plateScale = interpolate(gameContentFadeIn, [0, 1], [0.5, 1]);
  const plateOpacity = gameContentFadeIn;

  // Difficulty info based on progress
  const difficultyName = getDifficultyName(overallProgress);
  const difficultyColor = getDifficultyColor(overallProgress);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f8f5f2", // Light cream/off-white
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
      }}
    >
      {/* ===== INTRO SCREEN ===== */}
      {isIntroPhase && (
        <>
          {/* Main Title */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              textAlign: "center",
              transform: "translateY(-50%)",
              opacity: introFadeOut,
            }}
          >
            <div
              style={{
                fontSize: orientation === "portrait" ? 72 : 56,
                fontWeight: 800,
                color: "#1a1a2e",
                textTransform: "uppercase",
                letterSpacing: 6,
                marginBottom: 20,
              }}
            >
              Test Your Color Vision | Ishihara Eye Test
            </div>
            <div
              style={{
                fontSize: orientation === "portrait" ? 36 : 40,
                fontWeight: 600,
                color: "#22c55e",
                marginBottom: 30,
              }}
            >
              Can You Beat All Levels?
            </div>
            <div
              style={{
                fontSize: orientation === "portrait" ? 24 : 26,
                fontWeight: 400,
                color: "#666666",
              }}
            >
              Difficulty increases as you go!
            </div>
          </div>

          {/* Countdown in corner */}
          {countdownNumber <= 3 && countdownNumber > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: orientation === "portrait" ? 200 : 100,
                left: 0,
                right: 0,
                textAlign: "center",
                fontSize: orientation === "portrait" ? 48 : 36,
                fontWeight: 700,
                color: "#1a1a2e",
                opacity: introFadeOut,
              }}
            >
              Starting in {countdownNumber}...
            </div>
          )}
        </>
      )}

      {/* ===== GAME SCREEN ===== */}
      {!isIntroPhase && (
        <>
          {/* Title */}
          <div
            style={{
              position: "absolute",
              top: orientation === "portrait" ? 120 : 40,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#1a1a2e",
              fontSize: orientation === "portrait" ? 48 : 36,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 4,
              opacity: gameContentFadeIn,
            }}
          >
            Color Vision Test
          </div>

          {/* Subtitle */}
          <div
            style={{
              position: "absolute",
              top: orientation === "portrait" ? 180 : 85,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#666666",
              fontSize: orientation === "portrait" ? 28 : 22,
              fontWeight: 400,
              opacity: gameContentFadeIn,
            }}
          >
            What number do you see?
          </div>

          {/* Difficulty Label */}
          {showDifficulty && (
            <div
              style={{
                position: "absolute",
                top: orientation === "portrait" ? 280 : 130,
                left: 0,
                right: 0,
                textAlign: "center",
                opacity: puzzleTransition,
                transform: `scale(${interpolate(puzzleTransition, [0, 1], [1.3, 1])})`,
              }}
            >
              <span
                style={{
                  backgroundColor: difficultyColor,
                  color: "#000",
                  padding: "8px 24px",
                  borderRadius: 20,
                  fontSize: orientation === "portrait" ? 28 : 22,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                {difficultyName} • {currentPuzzleIndex + 1}/{puzzleCount}
              </span>
            </div>
          )}

          {/* Ishihara Plate */}
          <div
            style={{
              transform: `scale(${plateScale})`,
              opacity: plateOpacity,
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
                  fill={
                    dot.isInsideNumber ? currentNumberColor : currentBgColor
                  }
                />
              ))}
            </svg>
          </div>

          {/* Timer */}
          {showTimer && (
            <div
              style={{
                position: "absolute",
                bottom: orientation === "portrait" ? 280 : 130,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "#1a1a2e",
                fontSize: orientation === "portrait" ? 64 : 48,
                fontWeight: 700,
                opacity: gameContentFadeIn,
              }}
            >
              {puzzleTimeRemaining}
            </div>
          )}

          {/* Progress Bar */}
          <div
            style={{
              position: "absolute",
              bottom: orientation === "portrait" ? 200 : 80,
              left: "50%",
              transform: "translateX(-50%)",
              width: orientation === "portrait" ? "80%" : "60%",
              height: 8,
              backgroundColor: "#d4d4d4",
              borderRadius: 4,
              overflow: "hidden",
              opacity: gameContentFadeIn,
            }}
          >
            <div
              style={{
                width: `${(currentPuzzleIndex * 100) / puzzleCount + (frameInPuzzle / currentPuzzle.duration) * (100 / puzzleCount)}%`,
                height: "100%",
                backgroundColor: "#22c55e",
                borderRadius: 4,
              }}
            />
          </div>

          {/* Level indicators */}
          <div
            style={{
              position: "absolute",
              bottom: orientation === "portrait" ? 140 : 40,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: puzzleCount > 10 ? 8 : 20,
              flexWrap: "wrap",
              padding: "0 40px",
              opacity: gameContentFadeIn,
            }}
          >
            {puzzleLevels.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentPuzzleIndex ? 14 : 10,
                  height: i === currentPuzzleIndex ? 14 : 10,
                  borderRadius: "50%",
                  backgroundColor:
                    i <= currentPuzzleIndex ? "#22c55e" : "#c4c4c4",
                  border:
                    i === currentPuzzleIndex ? "2px solid #1a1a2e" : "none",
                }}
              />
            ))}
          </div>

          {/* CTA Text */}
          <div
            style={{
              position: "absolute",
              bottom: orientation === "portrait" ? 60 : 10,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#888888",
              fontSize: orientation === "portrait" ? 22 : 16,
              opacity: gameContentFadeIn,
            }}
          >
            Comment the number below! 👇
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
