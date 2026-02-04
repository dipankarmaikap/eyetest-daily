import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { random } from "remotion";

const OUT_DIR = "out/series";
const FPS = 30;

interface SeriesConfig {
  name: string;
  puzzleCount?: number;
  targetMinutes?: number;
  puzzleDuration: number;
  transitionDuration: number;
  levelIntroDuration: number;
  startSeed: number;
  grid: number;
  gap: number;
  cellSize: number;
}

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULT_CONFIG: Omit<
  SeriesConfig,
  "name" | "targetMinutes" | "puzzleCount"
> = {
  puzzleDuration: 300, // 10 sec per puzzle
  transitionDuration: 150, // 5 sec countdown
  levelIntroDuration: 90, // 3 sec level intro
  startSeed: 1,
  grid: 6,
  gap: 12,
  cellSize: 100,
};

// Generate config from target minutes
function generateConfig(targetMinutes: number, seed?: number): SeriesConfig {
  return {
    name: `oddoneout_${targetMinutes}min`,
    targetMinutes,
    ...DEFAULT_CONFIG,
    startSeed: seed ?? Math.floor(random(null) * 1000),
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculatePuzzleCount(config: SeriesConfig): number {
  if (config.puzzleCount) return config.puzzleCount;
  if (config.targetMinutes) {
    const targetFrames = config.targetMinutes * 60 * FPS;
    const introDuration = 3 * config.levelIntroDuration;
    const availableFrames = targetFrames - introDuration;
    return Math.floor(
      (availableFrames + config.transitionDuration) /
        (config.puzzleDuration + config.transitionDuration),
    );
  }
  return 10; // Default
}

function calculateDuration(config: SeriesConfig): number {
  const puzzleCount = calculatePuzzleCount(config);
  const introDuration = 3 * config.levelIntroDuration;
  const puzzlesDuration = puzzleCount * config.puzzleDuration;
  const transitionsDuration = (puzzleCount - 1) * config.transitionDuration;
  return introDuration + puzzlesDuration + transitionsDuration;
}

function formatDuration(frames: number, fps: number = 30): string {
  const totalSeconds = Math.floor(frames / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

// ============================================
// RENDER LOGIC
// ============================================

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Parse command line args
const args = process.argv.slice(2);
const targetMinutes = args.length > 0 ? parseInt(args[0], 10) : 0;
const customSeed = args.length > 1 ? parseInt(args[1], 10) : undefined;

if (!targetMinutes || isNaN(targetMinutes) || targetMinutes <= 0) {
  console.log(`
🎬 OddOneOut Series Renderer

Usage:
  bun render-series-batch.ts <minutes> [seed]

Arguments:
  minutes  Target video duration in minutes (required)
  seed     Starting seed for puzzle generation (optional, random if not provided)

Examples:
  bun render-series-batch.ts 5        # Generate 5 minute video
  bun render-series-batch.ts 10       # Generate 10 minute video
  bun render-series-batch.ts 30       # Generate 30 minute video
  bun render-series-batch.ts 60       # Generate 1 hour video
  bun render-series-batch.ts 50 100   # Generate 50 min video with seed 100
`);
  process.exit(0);
}

const config = generateConfig(targetMinutes, customSeed);
const puzzleCount = calculatePuzzleCount(config);
const totalFrames = calculateDuration(config);

console.log("\n🎬 OddOneOut Series Renderer\n");
console.log("=".repeat(50));
console.log(`  Target Duration: ${targetMinutes} minutes`);
console.log(`  Puzzles: ${puzzleCount}`);
console.log(`  Actual Duration: ${formatDuration(totalFrames)}`);
console.log(`  Seed: ${config.startSeed}`);
console.log(`  Grid: ${config.grid}x${config.grid}`);
console.log(`  Puzzle Time: ${config.puzzleDuration / FPS}s`);
console.log(`  Countdown: ${config.transitionDuration / FPS}s`);
console.log("=".repeat(50));

const filename = `${config.name}.mp4`;
const output = path.join(OUT_DIR, filename);

console.log(`\nRendering: ${filename}\n`);

// Prepare props
const props = {
  puzzleCount: puzzleCount,
  puzzleDuration: config.puzzleDuration,
  transitionDuration: config.transitionDuration,
  levelIntroDuration: config.levelIntroDuration,
  startSeed: config.startSeed,
  grid: config.grid,
  gap: config.gap,
  cellSize: config.cellSize,
};

// Write props to temp file
const propsPath = path.join(OUT_DIR, `temp_props_${config.name}.json`);
fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

try {
  // Pass --frames as range to override the composition's default duration
  execSync(
    `npx remotion render src/index.ts OddOneOutSeries "${output}" --props="${propsPath}" --frames=0-${totalFrames - 1}`,
    { stdio: "inherit" },
  );
  console.log(`\n✅ Done: ${output}`);
  console.log(`   Duration: ${formatDuration(totalFrames)}`);
  console.log(`   Puzzles: ${puzzleCount}`);
} catch {
  console.error(`\n❌ Failed to render: ${filename}`);
} finally {
  if (fs.existsSync(propsPath)) {
    fs.unlinkSync(propsPath);
  }
}
