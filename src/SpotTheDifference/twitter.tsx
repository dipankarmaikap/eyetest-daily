import { AbsoluteFill, Img, staticFile, random } from "remotion";
import { AbstractPastelBackground } from "./AnimatedBackground";

type Props = {
  differences: number;
  topImage: string;
  bottomImage: string;
};

export const SpotTheDifferenceTwitter: React.FC<Props> = ({
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
          fontFamily: "Inter, sans-serif",
        }}
        className="flex w-full h-full items-center justify-center"
      >
        {/* Images */}
        <div className="flex items-center justify-center gap-12">
          <div
            style={{
              display: "inline-flex",
              border: "6px solid black",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "max-content", // KEY
              position: "relative",
            }}
          >
            <Img
              src={staticFile(topImage)}
              style={{
                maxHeight: 500,
                width: "auto",
                height: "auto",
                display: "block",
              }}
            />
            <p className="absolute top-4 right-4 text-4xl font-black opacity-10">
              EyeTest Daily
            </p>
          </div>
          <div
            style={{
              display: "inline-flex",
              border: "6px solid black",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "max-content", // KEY
              position: "relative",
            }}
          >
            <Img
              src={staticFile(bottomImage)}
              style={{
                maxHeight: 500,
                width: "100%",
                objectFit: "contain",
              }}
            />
            <p className="absolute top-4 right-4 text-4xl font-black opacity-10">
              EyeTest Daily
            </p>
          </div>
        </div>
      </AbsoluteFill>
    </>
  );
};
