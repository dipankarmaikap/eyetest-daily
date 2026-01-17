import { AbsoluteFill, Img, staticFile, random } from "remotion";
import { Title } from "./Title";
import { AbstractPastelBackground } from "./AnimatedBackground";

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
        <div className="flex flex-col items-center gap-12 mt-12">
          <div
            style={{
              display: "inline-flex",
              border: "6px solid black",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "max-content", // KEY
            }}
          >
            <Img
              src={staticFile(topImage)}
              style={{
                maxHeight: 750,
                width: "auto",
                height: "auto",
                display: "block",
              }}
            />
          </div>
          <div
            style={{
              display: "inline-flex",
              border: "6px solid black",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "max-content", // KEY
            }}
          >
            <Img
              src={staticFile(bottomImage)}
              style={{
                maxHeight: 750,
                width: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </>
  );
};
