import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { random } from "remotion";

const OUT_DIR = "out/series";
const FPS = 30;

// ============================================
// 🎵 MUSIC PLAYLIST - Each video gets a different track
// ============================================

const MUSIC_PLAYLIST = [
  "Stay - Oliver Tray _ @RFM_NCM.mp4",
  "Chill Vibes - Justhea _ @RFM_NCM.webm",
  "Better Days - Roa _ @RFM_NCM _ Royalty Free Music _ RFM - NCM _ No Copyright Music.webm",
  "Paradise - Tobjan _ @RFM_NCM.webm",
  "Golden Sun - Spiring _ @RFM_NCM.webm",
  "Happiness - Bryo _ @RFM_NCM.webm",
  "Good Vibes Only - Wanheda _ @RFM_NCM.webm",
  "Summer Love - Helkimer _ @RFM_NCM.webm",
  "Sunshine - Tobjan _ Royalty Free Music No Copyright Free Background Music For Videos Free Download.webm",
  "Island - MBB _ Royalty Free Music _ RFM - NCM _ No Copyright Music _ Tropical _ Happy _ Chill _ Vlog.webm",
];

const MUSIC_VOLUME = 0.3; // 0-1 (0.3 = 30% volume)

// Get music file for a specific video index (cycles through playlist)
function getMusicFile(index: number): string {
  return MUSIC_PLAYLIST[index % MUSIC_PLAYLIST.length];
}

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

// Parse command line args - supports multiple durations
const args = process.argv.slice(2);
const targetMinutesList = args
  .map((arg) => parseInt(arg, 10))
  .filter((n) => !isNaN(n) && n > 0);

if (targetMinutesList.length === 0) {
  console.log(`
🎬 OddOneOut Series Renderer

Usage:
  bun render-series-batch.ts <minutes> [minutes2] [minutes3] ...

Arguments:
  minutes  Target video duration(s) in minutes (at least one required)

Examples:
  bun render-series-batch.ts 5              # Generate 5 minute video
  bun render-series-batch.ts 5 10 20 30 60  # Generate 5, 10, 20, 30min & 1hr videos
  bun render-series-batch.ts 60             # Generate 1 hour video
`);
  process.exit(0);
}

console.log("\n🎬 OddOneOut Series Batch Renderer\n");
console.log("=".repeat(50));
console.log(`  Videos to render: ${targetMinutesList.length}`);
console.log(
  `  Durations: ${targetMinutesList.map((m) => (m >= 60 ? `${m / 60}hr` : `${m}min`)).join(", ")}`,
);
console.log("=".repeat(50));

// Preview all videos
console.log("\n📋 Render Queue:\n");
targetMinutesList.forEach((minutes, i) => {
  const config = generateConfig(minutes, minutes * 100); // Use minutes*100 as seed for consistency
  const puzzles = calculatePuzzleCount(config);
  const duration = formatDuration(calculateDuration(config));
  const music = getMusicFile(i).split(" - ")[0]; // Just show artist/track name
  console.log(
    `  [${i + 1}] ${minutes}min → ${puzzles} puzzles → ${duration} 🎵 ${music}`,
  );
});

console.log("\n" + "=".repeat(50) + "\n");

// Render each video
for (let i = 0; i < targetMinutesList.length; i++) {
  const targetMinutes = targetMinutesList[i];
  const config = generateConfig(targetMinutes, targetMinutes * 100);
  const puzzleCount = calculatePuzzleCount(config);
  const totalFrames = calculateDuration(config);

  const filename = `${config.name}.mp4`;
  const output = path.join(OUT_DIR, filename);

  console.log(
    `\n[${i + 1}/${targetMinutesList.length}] Rendering: ${filename}`,
  );
  console.log(`  Target: ${targetMinutes} min`);
  console.log(`  Puzzles: ${puzzleCount}`);
  console.log(`  Duration: ${formatDuration(totalFrames)}`);

  const musicFile = getMusicFile(i);

  const props = {
    puzzleCount: puzzleCount,
    puzzleDuration: config.puzzleDuration,
    transitionDuration: config.transitionDuration,
    levelIntroDuration: config.levelIntroDuration,
    startSeed: config.startSeed,
    grid: config.grid,
    gap: config.gap,
    cellSize: config.cellSize,
    musicFile: musicFile,
    musicVolume: MUSIC_VOLUME,
  };

  console.log(`  🎵 Music: ${musicFile.split(" - ")[0]}...`);

  const propsPath = path.join(OUT_DIR, `temp_props_${config.name}.json`);
  fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

  try {
    execSync(
      `npx remotion render src/index.ts OddOneOutSeries "${output}" --props="${propsPath}" --frames=0-${totalFrames - 1}`,
      { stdio: "inherit" },
    );
    console.log(`  ✅ Done: ${filename}`);
  } catch {
    console.error(`  ❌ Failed: ${filename}`);
  } finally {
    if (fs.existsSync(propsPath)) {
      fs.unlinkSync(propsPath);
    }
  }
}

console.log(`\n🎉 Batch complete! Videos saved to: ${OUT_DIR}\n`);

// Summary
console.log("Summary:");
targetMinutesList.forEach((minutes) => {
  const config = generateConfig(minutes, minutes * 100);
  const outputPath = path.join(OUT_DIR, `${config.name}.mp4`);
  const exists = fs.existsSync(outputPath);
  const duration = formatDuration(calculateDuration(config));
  console.log(
    `  ${exists ? "✅" : "❌"} oddoneout_${minutes}min.mp4 - ${duration}`,
  );
});
