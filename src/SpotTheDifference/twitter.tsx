import { AbsoluteFill, Img, staticFile } from "remotion";

type Props = {
  differences: number;
  topImage: string;
  bottomImage: string;
};

export const SpotTheDifferenceTwitter: React.FC<Props> = ({
  topImage,
  bottomImage,
}) => {
  return (
    <>
      <AbsoluteFill
        style={{
          fontFamily: "Inter, sans-serif",
        }}
        className="flex w-full h-full items-center justify-center bg-white"
      >
        {/* Images */}
        <div className="flex flex-col items-center justify-center gap-12">
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
                maxHeight: 400,
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
                maxHeight: 400,
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
