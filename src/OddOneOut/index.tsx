import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GridCell } from "./components/GridCell";
import { hsl, randomInt } from "./utils/color";

const GRID = 8;
const GAP = 14;
const CELL = 96;

export const OddOneOut: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const frame = useCurrentFrame();

  // Use seed for consistent random values across frames
  const baseHue = randomInt(0, 360, `hue-${seed}`);
  const delta = randomInt(4, 8, `delta-${seed}`);
  const oddIndex = randomInt(0, GRID * GRID - 1, `oddIndex-${seed}`);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Hook */}
      {frame < 45 && (
        <div
          style={{
            position: "absolute",
            top: 120,
            fontSize: 56,
            fontWeight: 800,
          }}
        >
          One is different 👀
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`,
          gap: GAP,
        }}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => (
          <GridCell
            key={i}
            size={CELL}
            color={hsl(i === oddIndex ? baseHue + delta : baseHue)}
          />
        ))}
      </div>

      {/* CTA */}
      {frame > 150 && (
        <div
          style={{
            position: "absolute",
            bottom: 140,
            fontSize: 48,
            fontWeight: 800,
          }}
        >
          Where is it? (Row–Column)
        </div>
      )}
    </AbsoluteFill>
  );
};
