import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { OddOneOut } from "./landscape";
import { hsl } from "./utils/color";
import { loadFont } from "@remotion/google-fonts/ComicRelief";
import { ShapeType } from "./components/GridCell";

const { fontFamily } = loadFont();

type Difficulty = "easy" | "medium" | "hard";

interface PuzzleConfig {
  seed: number;
  difficulty: Difficulty;
  shape?: ShapeType;
}

export interface OddOneOutSeriesProps {
  /** Total number of puzzles in the series */
  puzzleCount?: number;
  /** Duration of each puzzle in frames */
  puzzleDuration?: number;
  /** Duration of transition between puzzles in frames */
  transitionDuration?: number;
  /** Duration of level intro in frames */
  levelIntroDuration?: number;
  /** Starting seed for randomization */
  startSeed?: number;
  /** Grid size for puzzles */
  grid?: number;
  /** Gap between cells */
  gap?: number;
  /** Cell size */
  cellSize?: number;
  /** Custom puzzle configs (overrides auto-generation) */
  puzzles?: PuzzleConfig[];
  /** Target duration in seconds - auto-calculates puzzle count */
  targetDurationSeconds?: number;
  /** Background music file (from public/audio folder) */
  musicFile?: string;
  /** Music volume (0-1) */
  musicVolume?: number;
}

// Generate puzzles with progressive difficulty
function generatePuzzles(count: number, startSeed: number): PuzzleConfig[] {
  const puzzles: PuzzleConfig[] = [];

  // Distribute puzzles: 30% easy, 35% medium, 35% hard
  const easyCount = Math.floor(count * 0.3);
  const mediumCount = Math.floor(count * 0.35);

  for (let i = 0; i < count; i++) {
    let difficulty: Difficulty;
    if (i < easyCount) {
      difficulty = "easy";
    } else if (i < easyCount + mediumCount) {
      difficulty = "medium";
    } else {
      difficulty = "hard";
    }

    puzzles.push({
      seed: startSeed + i,
      difficulty,
    });
  }

  return puzzles;
}

// Level transition screen
const LevelIntro: React.FC<{
  level: Difficulty;
  puzzleNumber: number;
  totalPuzzles: number;
}> = ({ level, puzzleNumber, totalPuzzles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const levelConfig = {
    easy: { emoji: "😊", color: hsl(120, 60, 45), label: "EASY MODE" },
    medium: { emoji: "💪", color: hsl(45, 80, 50), label: "MEDIUM MODE" },
    hard: { emoji: "🔥", color: hsl(0, 80, 50), label: "HARD MODE" },
  };

  const config = levelConfig[level];

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${config.color}22 0%, ${config.color}44 100%)`,
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          transform: `scale(${scale})`,
        }}
      >
        <div style={{ fontSize: 120 }}>{config.emoji}</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            fontFamily,
            color: config.color,
            textShadow: "3px 3px 0 white",
          }}
        >
          {config.label}
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            fontFamily,
            color: "#666",
          }}
        >
          Puzzles {puzzleNumber} - {totalPuzzles}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Countdown between puzzles
const CountdownTransition: React.FC<{
  nextPuzzle: number;
  totalPuzzles: number;
  durationInFrames: number;
  nextDifficulty: Difficulty;
}> = ({ nextPuzzle, totalPuzzles, durationInFrames, nextDifficulty }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get color based on upcoming difficulty
  const difficultyColors = {
    easy: hsl(120, 60, 45), // Green
    medium: hsl(45, 80, 50), // Yellow/Orange
    hard: hsl(0, 80, 50), // Red
  };
  const accentColor = difficultyColors[nextDifficulty];

  // Calculate countdown number (5, 4, 3, 2, 1)
  const countdownSeconds = 5;
  const framesPerSecond = durationInFrames / countdownSeconds;
  const currentCount = Math.max(
    1,
    countdownSeconds - Math.floor(frame / framesPerSecond),
  );

  // Animation for each number
  const frameInSecond = frame % framesPerSecond;
  const scale = spring({
    frame: frameInSecond,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  const opacity = interpolate(
    frameInSecond,
    [0, framesPerSecond * 0.2, framesPerSecond * 0.8, framesPerSecond],
    [0, 1, 1, 0.3],
    { extrapolateRight: "clamp" },
  );

  // Circle progress
  const progress = frame / durationInFrames;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Circular progress */}
      <svg width="300" height="300" style={{ position: "absolute" }}>
        {/* Background circle */}
        <circle
          cx="150"
          cy="150"
          r="120"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="150"
          cy="150"
          r="120"
          fill="none"
          stroke={accentColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 150 150)"
        />
      </svg>

      {/* Countdown number */}
      <div
        style={{
          fontSize: 180,
          fontWeight: 900,
          fontFamily,
          color: accentColor,
          transform: `scale(${scale})`,
          opacity,
          textShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {currentCount}
      </div>

      {/* Next puzzle text */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          fontSize: 32,
          fontWeight: 600,
          fontFamily,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        Next puzzle: {nextPuzzle} / {totalPuzzles}
      </div>

      {/* "Get Ready" text */}
      <div
        style={{
          position: "absolute",
          top: 200,
          fontSize: 48,
          fontWeight: 800,
          fontFamily,
          color: accentColor,
          textTransform: "uppercase",
          letterSpacing: 4,
        }}
      >
        Get Ready!
      </div>
    </AbsoluteFill>
  );
};

// Progress bar overlay
const ProgressOverlay: React.FC<{
  currentPuzzle: number;
  totalPuzzles: number;
  difficulty: Difficulty;
}> = ({ currentPuzzle, totalPuzzles, difficulty }) => {
  const progress = (currentPuzzle / totalPuzzles) * 100;

  const difficultyColor = {
    easy: hsl(120, 60, 45),
    medium: hsl(45, 80, 50),
    hard: hsl(0, 80, 50),
  };

  return (
    <>
      {/* Puzzle counter */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 40,
          fontFamily,
          padding: "8px 20px",
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          fontSize: 24,
          fontWeight: 700,
          borderRadius: 20,
        }}
      >
        {currentPuzzle} / {totalPuzzles}
      </div>

      {/* Progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: difficultyColor[difficulty],
          }}
        />
      </div>
    </>
  );
};

export const OddOneOutSeries: React.FC<OddOneOutSeriesProps> = ({
  puzzleCount: inputPuzzleCount,
  puzzleDuration = 300, // 10 sec @ 30fps
  transitionDuration = 150, // 5 sec countdown @ 30fps (5 * 30 = 150)
  levelIntroDuration = 90, // 3 sec
  startSeed = 1,
  grid = 8,
  gap = 10,
  cellSize = 85,
  puzzles: customPuzzles,
  targetDurationSeconds,
  musicFile,
  musicVolume = 0.3,
}) => {
  const { fps } = useVideoConfig();

  // Auto-calculate puzzle count from target duration
  const puzzleCount =
    inputPuzzleCount ??
    (targetDurationSeconds
      ? calculatePuzzleCountFromDuration(
          targetDurationSeconds,
          puzzleDuration,
          transitionDuration,
          levelIntroDuration,
          fps,
        )
      : 100);

  const puzzles = customPuzzles ?? generatePuzzles(puzzleCount, startSeed);

  // Calculate level intro positions
  const mediumStart = puzzles.findIndex((p) => p.difficulty === "medium");
  const hardStart = puzzles.findIndex((p) => p.difficulty === "hard");

  let currentFrame = 0;
  const sequences: React.ReactNode[] = [];

  // Track when we need level intros
  let lastDifficulty: Difficulty | null = null;

  puzzles.forEach((puzzle, index) => {
    // Add level intro when difficulty changes
    if (puzzle.difficulty !== lastDifficulty) {
      const levelStartPuzzle = index + 1;
      const levelEndPuzzle =
        puzzle.difficulty === "easy"
          ? mediumStart
          : puzzle.difficulty === "medium"
            ? hardStart
            : puzzles.length;

      sequences.push(
        <Sequence
          key={`intro-${puzzle.difficulty}`}
          from={currentFrame}
          durationInFrames={levelIntroDuration}
        >
          <LevelIntro
            level={puzzle.difficulty}
            puzzleNumber={levelStartPuzzle}
            totalPuzzles={levelEndPuzzle}
          />
        </Sequence>,
      );
      currentFrame += levelIntroDuration;
      lastDifficulty = puzzle.difficulty;
    }

    // Add the puzzle
    sequences.push(
      <Sequence
        key={`puzzle-${index}`}
        from={currentFrame}
        durationInFrames={puzzleDuration}
      >
        <OddOneOut
          seed={puzzle.seed}
          difficulty={puzzle.difficulty}
          shape={puzzle.shape}
          grid={grid}
          gap={gap}
          cellSize={cellSize}
        />
        <ProgressOverlay
          currentPuzzle={index + 1}
          totalPuzzles={puzzles.length}
          difficulty={puzzle.difficulty}
        />
      </Sequence>,
    );
    currentFrame += puzzleDuration;

    // Add countdown transition (except for last puzzle)
    if (index < puzzles.length - 1 && transitionDuration > 0) {
      sequences.push(
        <Sequence
          key={`countdown-${index}`}
          from={currentFrame}
          durationInFrames={transitionDuration}
        >
          <CountdownTransition
            nextPuzzle={index + 2}
            totalPuzzles={puzzles.length}
            durationInFrames={transitionDuration}
            nextDifficulty={puzzles[index + 1].difficulty}
          />
        </Sequence>,
      );
      currentFrame += transitionDuration;
    }
  });

  // Solid background to prevent gaps
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      {sequences}
      {musicFile && (
        <Html5Audio
          loop={true}
          src={staticFile(`audio/${musicFile}`)}
          volume={musicVolume}
        />
      )}
    </AbsoluteFill>
  );
};

// Calculate total duration for a series
export function calculateSeriesDuration(
  puzzleCount: number,
  puzzleDuration: number = 300,
  transitionDuration: number = 0,
  levelIntroDuration: number = 90,
): number {
  // 3 level intros (easy, medium, hard)
  const introDuration = 3 * levelIntroDuration;
  // All puzzles
  const puzzlesDuration = puzzleCount * puzzleDuration;
  // Transitions between puzzles (count - 1)
  const transitionsDuration = (puzzleCount - 1) * transitionDuration;

  return introDuration + puzzlesDuration + transitionsDuration;
}

// Calculate puzzle count from target duration
export function calculatePuzzleCountFromDuration(
  targetDurationSeconds: number,
  puzzleDuration: number = 300,
  transitionDuration: number = 0,
  levelIntroDuration: number = 90,
  fps: number = 30,
): number {
  const targetFrames = targetDurationSeconds * fps;
  const introDuration = 3 * levelIntroDuration; // 3 level intros
  const availableFrames = targetFrames - introDuration;

  // Each puzzle takes: puzzleDuration + transitionDuration (except last)
  // So: count * puzzleDuration + (count - 1) * transitionDuration = availableFrames
  // count * (puzzleDuration + transitionDuration) - transitionDuration = availableFrames
  // count = (availableFrames + transitionDuration) / (puzzleDuration + transitionDuration)

  const puzzleCount = Math.floor(
    (availableFrames + transitionDuration) /
      (puzzleDuration + transitionDuration),
  );

  return Math.max(1, puzzleCount);
}

// Helper to calculate duration from target minutes
export function calculateSeriesDurationFromMinutes(
  targetMinutes: number,
  puzzleDuration: number = 300,
  transitionDuration: number = 0,
  levelIntroDuration: number = 90,
  fps: number = 30,
): { puzzleCount: number; totalFrames: number; actualMinutes: number } {
  const targetSeconds = targetMinutes * 60;
  const puzzleCount = calculatePuzzleCountFromDuration(
    targetSeconds,
    puzzleDuration,
    transitionDuration,
    levelIntroDuration,
    fps,
  );
  const totalFrames = calculateSeriesDuration(
    puzzleCount,
    puzzleDuration,
    transitionDuration,
    levelIntroDuration,
  );
  const actualMinutes = totalFrames / fps / 60;

  return { puzzleCount, totalFrames, actualMinutes };
}
