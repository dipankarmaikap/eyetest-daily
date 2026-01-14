import { AbsoluteFill, useCurrentFrame } from "remotion";
import { generateBlobs } from "../utils/generateBlobs";
import { pickBackgroundColor } from "../utils/pickBackgroundColor";
import { pickBlobColor } from "../utils/pickBlobColor";

type Props = {
  seed?: number;
};
export const AbstractPastelBackground = ({ seed = 42 }: Props) => {
  const frame = useCurrentFrame();
  const blobs = generateBlobs(14, seed);
  const backgroundColor = pickBackgroundColor(seed);
  const blobColor = pickBlobColor(seed);
  return (
    <AbsoluteFill
      style={{
        background: backgroundColor,
        overflow: "hidden",
      }}
    >
      {blobs.map((blob, i) => {
        const speed = 2; // 👈 increase this

        const driftX = Math.sin((frame * speed) / (90 + i * 10)) * (30 + i * 6);
        const driftY =
          Math.cos((frame * speed) / (110 + i * 12)) * (40 + i * 8);
        const rotate = Math.sin((frame * speed) / (160 + i * 20)) * 12;
        const scale = 1 + Math.sin((frame * speed) / (140 + i * 15)) * 0.06;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: blob.size,
              height: blob.size,
              left: blob.x,
              top: blob.y,
              borderRadius: blob.radius,
              background: blobColor,
              opacity: blob.opacity,
              filter: blob.blur ? `blur(${blob.blur}px)` : undefined,
              transform: `
                translate(${driftX}px, ${driftY}px)
                rotate(${rotate}deg)
                scale(${scale})
              `,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
