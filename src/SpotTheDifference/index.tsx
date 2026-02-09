import { AbsoluteFill, random } from "remotion";
import { AbstractPastelBackground } from "./AnimatedBackground";
import { loadFont } from "@remotion/google-fonts/Inter";
import FollowText from "./componnets/FollowText";
import CompareImage from "./componnets/CompareImage";
import HeaderSection from "./componnets/HeaderSection";
import { followTexts, mainTitles, secondaryCTAs } from "./utils";

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

  // Randomly choose between numbered and main title (10% for numbered)
  const useNumbered = random(seedPart + "title") < 0.1;
  let title = "";
  if (useNumbered) {
    title = `Spot ${differences} Differences`;
  } else {
    const idx = Math.floor(random(seedPart + "mainTitle") * mainTitles.length);
    title = mainTitles[idx];
  }
  // Pick CTA based on title type
  const ctaArr = useNumbered ? secondaryCTAs.numbered : secondaryCTAs.normal;
  const ctaIdx = Math.floor(random(seedPart + "cta") * ctaArr.length);
  const cta = ctaArr[ctaIdx];
  const followTextIdx = Math.floor(
    random(seedPart + "followText") * followTexts.length,
  );
  const followText = followTexts[followTextIdx];
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
          title={title}
          showLikeButton={showLikeButton}
          cta={cta}
        />
        <CompareImage
          topImage={topImage}
          bottomImage={bottomImage}
          showLikeButton={showLikeButton}
        />
        <FollowText followText={followText} />
      </AbsoluteFill>
    </>
  );
};
