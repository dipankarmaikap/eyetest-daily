import { Img, staticFile } from "remotion";

export default function CompareImage({
  topImage,
  bottomImage,
  showLikeButton,
}: {
  topImage: string;
  bottomImage: string;
  showLikeButton: boolean;
}) {
  return (
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
  );
}
