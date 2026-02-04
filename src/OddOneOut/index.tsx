import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GridCell, ShapeType } from "./components/GridCell";
import { hsl, randomInt } from "./utils/color";
import { loadFont } from "@remotion/google-fonts/ComicRelief";

const { fontFamily } = loadFont();

const HOOKS = [
  "Test your color vision 👁️",
  "Check your color sensitivity",
  "How good is your color vision?",
  "Subtle color test",
  "Can your eyes detect the difference?",
  "Visual sensitivity check",
];

// Available shapes
const SHAPES: ShapeType[] = [
  "square",
  "circle",
  "diamond",
  "hexagon",
  "star",
  "triangle",
];

export interface OddOneOutProps {
  seed?: number;
  grid?: number;
  gap?: number;
  cellSize?: number;
  shape?: ShapeType;
  difficulty?: "easy" | "medium" | "hard";
}

export const OddOneOut: React.FC<OddOneOutProps> = ({
  seed = 1,
  grid = 8,
  gap = 12,
  cellSize = 90,
  shape: forcedShape,
  difficulty = "hard",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Difficulty affects color delta (how different the odd one is)
  const difficultyDelta = {
    easy: { min: 15, max: 25 },
    medium: { min: 8, max: 15 },
    hard: { min: 4, max: 8 },
  };

  // Use seed for consistent random values across frames
  const baseHue = randomInt(0, 360, `hue-${seed}`);
  const delta = randomInt(
    difficultyDelta[difficulty].min,
    difficultyDelta[difficulty].max,
    `delta-${seed}`,
  );
  const oddIndex = randomInt(0, grid * grid - 1, `oddIndex-${seed}`);
  const hookIndex = randomInt(0, HOOKS.length - 1, `hook-${seed}`);
  const shapeIndex = randomInt(0, SHAPES.length - 1, `shape-${seed}`);
  const shape = forcedShape ?? SHAPES[shapeIndex];

  // Calculate odd cell position for reveal
  const oddRow = Math.floor(oddIndex / grid) + 1;
  const oddCol = (oddIndex % grid) + 1;

  // Difficulty label
  const difficultyLabel = {
    easy: "😊 EASY",
    medium: "💪 MEDIUM",
    hard: "🔥 HARD",
  };

  // Animation phases
  const INTRO_END = 20;
  const REVEAL_START = 180;
  const showReveal = frame >= REVEAL_START;

  // Spring animations
  const gridScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const timerProgress = interpolate(
    frame,
    [INTRO_END, REVEAL_START],
    [0, 100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const revealScale = spring({
    frame: frame - REVEAL_START,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Pulsing effect for odd cell during reveal
  const pulseScale = showReveal
    ? 1 + 0.1 * Math.sin((frame - REVEAL_START) * 0.3)
    : 1;
  const TEXT_POSITION_Y = 180;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${hsl(baseHue, 15, 95)} 0%, ${hsl(baseHue + 30, 20, 90)} 100%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: TEXT_POSITION_Y,
          fontSize: 64,
          fontFamily,
          fontWeight: 900,
          color: hsl(baseHue, 70, 35),
          textShadow: "2px 2px 0 white",
        }}
      >
        {HOOKS[hookIndex]}
      </div>

      {/* Timer Bar */}
      {frame >= REVEAL_START ? null : (
        <>
          <div
            style={{
              position: "absolute",
              top: TEXT_POSITION_Y + 140,
              width: 700,
              height: 20,
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${timerProgress}%`,
                height: "100%",
                backgroundColor: interpolateColors(
                  timerProgress,
                  [0, 100],
                  [
                    hsl(baseHue, 70, 50), // Start: base color
                    hsl(0, 80, 50), // End: red for urgency
                  ],
                ),
                borderRadius: 6,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: TEXT_POSITION_Y + 190,
              fontSize: 40,
              fontWeight: 700,
              fontFamily,
              color: hsl(baseHue, 50, 40),
            }}
          >
            ⏱️ Find it before time runs out!
          </div>
        </>
      )}

      {/* Grid with staggered cell animation */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid}, ${cellSize}px)`,
          gap,
          transform: `scale(${gridScale})`,
        }}
      >
        {Array.from({ length: grid * grid }).map((_, i) => {
          const row = Math.floor(i / grid);
          const col = i % grid;
          const delay = (row + col) * 0.5;

          const cellSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, stiffness: 120 },
          });

          const isOdd = i === oddIndex;
          const cellScale = isOdd && showReveal ? pulseScale : 1;

          return (
            <div
              key={i}
              style={{
                transform: `scale(${cellSpring * cellScale})`,
                opacity: cellSpring,
              }}
            >
              <GridCell
                size={cellSize}
                color={hsl(isOdd ? baseHue + delta : baseHue)}
                highlight={isOdd && showReveal}
                shape={shape}
              />
            </div>
          );
        })}
      </div>

      {/* Reveal Answer */}
      {showReveal && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            transform: `scale(${revealScale})`,
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              fontFamily,
              color: hsl(baseHue + delta, 70, 40),
              textShadow: "2px 2px 0 white",
            }}
          >
            🎯 Row {oddRow}, Column {oddCol}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              fontFamily,
              color: hsl(baseHue, 50, 45),
            }}
          >
            Did you find it? 💬 Comment below!
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 350,
          fontFamily,
          opacity: 0.7,
          fontSize: 40,
          fontWeight: 400,
          display: "flex",
          color: hsl(baseHue, 50, 45),
          letterSpacing: 2,
        }}
      >
        @EyeTestDaily
      </div>
      {/* Difficulty badge */}
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 40,
          fontFamily,
          padding: "8px 20px",
          backgroundColor: hsl(baseHue, 60, 50),
          color: "white",
          fontSize: 22,
          fontWeight: 800,
          borderRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {difficultyLabel[difficulty]}
      </div>
    </AbsoluteFill>
  );
};
