import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PUZZLE_DIR = "public/puzzles/done";
const OUT_DIR = "out/youtube-post/";

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

for (const [id, puzzle] of Object.entries(puzzles)) {
  if (!puzzle.top || !puzzle.bottom) {
    console.warn(`Skipping ${id}: missing image`);
    continue;
  }
  const imageId = `${id}_spot_${puzzle.differences}_differences.png`;
  const imageOutput = path.join(OUT_DIR, imageId);

  console.log(`Rendering still ${id} → ${imageOutput}`);

  // Write props to a temporary JSON file
  const props = {
    topImage: `/puzzles/done/${puzzle.top}`,
    bottomImage: `/puzzles/done/${puzzle.bottom}`,
    differences: puzzle.differences,
  };
  const propsPath = path.join(OUT_DIR, `${id}_props.json`);
  fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

  execSync(
    `npx remotion still src/index.ts EyeTestDailyTwitter "${imageOutput}" --frame=0 --props=${propsPath} --image-format=png`,
  );
  // Remove the temporary JSON file
  fs.unlinkSync(propsPath);
}
