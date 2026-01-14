import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PUZZLE_DIR = "public/puzzles";
const OUT_DIR = "out";

interface PuzzleImages {
  differences: number;
  top?: string;
  bottom?: string;
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR);
}

const files: string[] = fs.readdirSync(PUZZLE_DIR);

// Group by puzzle id (p001, p002…)
const puzzles: Record<string, PuzzleImages> = {};

for (const file of files) {
  const match = file.match(/(p\d+)_(\d+)_(top|bottom)\.png$/);
  if (!match) continue;

  if (!match) continue;
  const [, id, diffCount, side] = match as RegExpMatchArray;
  if (!["top", "bottom"].includes(side)) continue;
  puzzles[id] ??= { differences: Number(diffCount) };
  puzzles[id][side as "top" | "bottom"] = file;
}

const DONE_DIR = path.join(PUZZLE_DIR, "done");
if (!fs.existsSync(DONE_DIR)) {
  fs.mkdirSync(DONE_DIR);
}

for (const [id, puzzle] of Object.entries(puzzles)) {
  if (!puzzle.top || !puzzle.bottom) {
    console.warn(`Skipping ${id}: missing image`);
    continue;
  }
  const videoId = `${id}_spot_${puzzle.differences}_differences.mp4`;
  const output = path.join(OUT_DIR, videoId);

  console.log(`Rendering ${id} → ${output}`);

  // Write props to a temporary JSON file
  const props = {
    topImage: `/puzzles/${puzzle.top}`,
    bottomImage: `/puzzles/${puzzle.bottom}`,
    differences: puzzle.differences,
  };
  const propsPath = path.join(OUT_DIR, `${id}_props.json`);
  fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

  execSync(
    `npx remotion render src/index.ts EyeTestDaily "${output}" --props=${propsPath}`,
    { stdio: "inherit" },
  );

  // Remove the temporary JSON file
  fs.unlinkSync(propsPath);

  // Move images to done folder
  for (const side of ["top", "bottom"] as const) {
    const img = puzzle[side];
    if (img) {
      const srcPath = path.join(PUZZLE_DIR, img);
      const destPath = path.join(DONE_DIR, img);
      fs.renameSync(srcPath, destPath);
    }
  }
}
