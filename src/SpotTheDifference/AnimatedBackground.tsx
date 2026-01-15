import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { pickBackgroundColor } from "../utils/pickBackgroundColor";
import { animatedShapeStyle, generateShapes } from "../utils/generateShapes";
import { pickBlobColor } from "../utils/pickBlobColor";

type Props = {
  seed?: number;
};
export const AbstractPastelBackground = ({ seed = 42 }: Props) => {
  const frame = useCurrentFrame();
  const backgroundColor = pickBackgroundColor(seed);
  const shapes = generateShapes(14, seed);
  const { durationInFrames } = useVideoConfig();
  const shapeColor = pickBlobColor(seed);

  return (
    <AbsoluteFill
      style={{
        background: backgroundColor,
        overflow: "hidden",
      }}
    >
      {shapes.map((s, i) => (
        <div
          key={i}
          style={{
            ...animatedShapeStyle(s, frame, durationInFrames),
            background: shapeColor,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
