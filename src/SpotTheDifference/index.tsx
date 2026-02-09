import { AbsoluteFill, random } from "remotion";
import { AbstractPastelBackground } from "./AnimatedBackground";
import { loadFont } from "@remotion/google-fonts/Inter";
import FollowText from "./componnets/FollowText";
import CompareImage from "./componnets/CompareImage";
import HeaderSection from "./componnets/HeaderSection";

const { fontFamily } = loadFont();
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
          fontFamily,
        }}
      >
        {/* Title */}
        <HeaderSection
          differences={differences}
          showLikeButton={showLikeButton}
        />
        <CompareImage
          topImage={topImage}
          bottomImage={bottomImage}
          showLikeButton={showLikeButton}
        />
        <FollowText />
      </AbsoluteFill>
    </>
  );
};
