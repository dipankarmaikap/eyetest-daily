import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  random,
} from "remotion";
import { Timer } from "./SpotTheDifference/Timer";
import { Title } from "./SpotTheDifference/Title";
import { AbstractPastelBackground } from "./SpotTheDifference/AnimatedBackground";

type Props = {
  differences: number;
  topImage: string;
  bottomImage: string;
};

export const SpotTheDifference: React.FC<Props> = ({
  differences,
  topImage,
  bottomImage,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const seed = random("Can you spot the difference?") * differences * 1000;

  return (
    <>
      <AbstractPastelBackground seed={seed} />
      <AbsoluteFill
        style={{
          padding: 60,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Title */}
        <Title differences={differences} />

        {/* Images */}
        <div className="flex flex-col gap-12 mt-12">
          <Img
            src={staticFile(topImage)}
            style={{
              maxHeight: 750,
              width: "100%",
              objectFit: "contain",
            }}
          />
          <Img
            src={staticFile(bottomImage)}
            style={{
              maxHeight: 750,
              width: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Timer */}
        <Timer frame={frame} totalFrames={durationInFrames} seconds={10} />
      </AbsoluteFill>
    </>
  );
};
