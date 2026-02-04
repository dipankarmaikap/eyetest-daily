import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUT_DIR = "out/oddoneout";

type ShapeType =
  | "square"
  | "circle"
  | "diamond"
  | "hexagon"
  | "star"
  | "triangle";
type Difficulty = "easy" | "medium" | "hard";

interface OddOneOutConfig {
  seed: number;
  grid?: number;
  gap?: number;
  cellSize?: number;
  shape?: ShapeType;
  difficulty?: Difficulty;
}

// ============================================
// 🎯 CONFIGURE YOUR BATCH RENDERS HERE
// ============================================

const BATCH_CONFIGS: OddOneOutConfig[] = [
  // Different seeds create different puzzles
  { seed: 1, difficulty: "hard" },
  { seed: 2, difficulty: "hard" },
  { seed: 3, difficulty: "medium" },
  { seed: 4, difficulty: "easy" },

  // Different shapes
  { seed: 10, shape: "circle", difficulty: "hard" },
  { seed: 11, shape: "star", difficulty: "hard" },
  { seed: 12, shape: "hexagon", difficulty: "medium" },
  { seed: 13, shape: "diamond", difficulty: "medium" },
  { seed: 14, shape: "triangle", difficulty: "easy" },

  // Different grid sizes
  { seed: 20, grid: 6, cellSize: 120, difficulty: "easy" },
  { seed: 21, grid: 8, cellSize: 95, difficulty: "medium" },
  { seed: 22, grid: 10, cellSize: 75, difficulty: "hard" },

  // Combinations
  { seed: 30, grid: 6, shape: "circle", difficulty: "easy" },
  { seed: 31, grid: 10, shape: "star", difficulty: "hard" },
  { seed: 32, grid: 8, shape: "hexagon", difficulty: "medium" },
];

// ============================================
// Or generate a range automatically:
// ============================================

export function generateRange(
  startSeed: number,
  count: number,
  baseConfig: Partial<OddOneOutConfig> = {},
): OddOneOutConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    seed: startSeed + i,
    ...baseConfig,
  }));
}

// Uncomment to use range generation instead:
// const BATCH_CONFIGS = generateRange(1, 30, { difficulty: "hard" });

// ============================================
// RENDER LOGIC
// ============================================

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generateFilename(config: OddOneOutConfig): string {
  const parts = [
    `seed${config.seed}`,
    config.shape ?? "random",
    `${config.grid ?? 8}x${config.grid ?? 8}`,
    config.difficulty ?? "hard",
  ];
  return `oddoneout_${parts.join("_")}.mp4`;
}

console.log(
  `\n🎬 Starting batch render of ${BATCH_CONFIGS.length} OddOneOut videos...\n`,
);

for (let i = 0; i < BATCH_CONFIGS.length; i++) {
  const config = BATCH_CONFIGS[i];
  const filename = generateFilename(config);
  const output = path.join(OUT_DIR, filename);

  console.log(`\n[${i + 1}/${BATCH_CONFIGS.length}] Rendering: ${filename}`);
  console.log(
    `  Config: seed=${config.seed}, grid=${config.grid ?? 8}, shape=${config.shape ?? "random"}, difficulty=${config.difficulty ?? "hard"}`,
  );

  // Prepare props
  const props: OddOneOutConfig = {
    seed: config.seed,
    grid: config.grid ?? 8,
    gap: config.gap ?? 12,
    cellSize: config.cellSize ?? 90,
    difficulty: config.difficulty ?? "hard",
  };

  // Only include shape if explicitly set
  if (config.shape) {
    props.shape = config.shape;
  }

  // Write props to temp file
  const propsPath = path.join(OUT_DIR, `temp_props_${config.seed}.json`);
  fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

  try {
    execSync(
      `npx remotion render src/index.ts OddOneOut "${output}" --props="${propsPath}"`,
      { stdio: "inherit" },
    );
    console.log(`  ✅ Done: ${filename}`);
  } catch {
    console.error(`  ❌ Failed: ${filename}`);
  } finally {
    // Clean up temp props file
    if (fs.existsSync(propsPath)) {
      fs.unlinkSync(propsPath);
    }
  }
}

console.log(`\n🎉 Batch render complete! Videos saved to: ${OUT_DIR}\n`);

// ============================================
// OPTIONAL: Generate still images for thumbnails
// ============================================

const RENDER_THUMBNAILS = false; // Set to true to also render thumbnail images

if (RENDER_THUMBNAILS) {
  console.log("\n📸 Rendering thumbnails...\n");

  for (const config of BATCH_CONFIGS) {
    const filename = generateFilename(config).replace(".mp4", ".png");
    const output = path.join(OUT_DIR, "thumbnails", filename);

    const props: OddOneOutConfig = {
      seed: config.seed,
      grid: config.grid ?? 8,
      gap: config.gap ?? 12,
      cellSize: config.cellSize ?? 90,
      difficulty: config.difficulty ?? "hard",
    };
    if (config.shape) props.shape = config.shape;

    const propsPath = path.join(
      OUT_DIR,
      `temp_thumb_props_${config.seed}.json`,
    );
    fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

    try {
      execSync(
        `npx remotion still src/index.ts OddOneOut "${output}" --frame=90 --props="${propsPath}"`,
        { stdio: "inherit" },
      );
    } catch {
      console.error(`Failed thumbnail: ${filename}`);
    } finally {
      if (fs.existsSync(propsPath)) fs.unlinkSync(propsPath);
    }
  }
}
