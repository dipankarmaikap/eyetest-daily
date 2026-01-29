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
  const seedPart = topImage + bottomImage;
  const seed = random(seedPart) * differences * 1000;
  const showLikeButton = random(seedPart) < 0.5;

  return (
    <>
      <AbstractPastelBackground seed={seed} />
      <AbsoluteFill
        style={{
          padding: showLikeButton ? 40 : 60,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Title */}
        <div className="text-center">
          <Title differences={differences} />
        </div>
        {showLikeButton && (
          <div className="text-center">
            <div className="bg-white inline-flex items-center justify-center rounded-full mt-6">
              <p className="px-8 py-2 font-semibold" style={{ fontSize: 40 }}>
                Found it? Double tap ❤️
              </p>
            </div>
          </div>
        )}

        {/* Images */}
        <div
          className={`flex flex-col items-center gap-12 ${showLikeButton ? "mt-8" : "mt-12"}`}
        >
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
                maxHeight: showLikeButton ? 720 : 750,
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
                maxHeight: showLikeButton ? 720 : 750,
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
