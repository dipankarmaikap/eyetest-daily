import "./index.css";
import { Composition } from "remotion";
import { SpotTheDifference } from "./SpotTheDifference";
import { AiVideoTimelaps, AiVideoTimelapsSchema } from "./AiVideoTimelaps";
import { SpotTheDifferenceTwitter } from "./SpotTheDifference/twitter";
import { EyeTestBall } from "./EyeTestBall";
import { OddOneOut } from "./OddOneOut";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EyeTestDaily"
        component={SpotTheDifference}
        durationInFrames={300} // 10 sec @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          differences: 3,
          topImage: "puzzles/done/p42_3_top.png",
          bottomImage: "puzzles/done/p42_3_bottom.png",
        }}
      />
      <Composition
        id="OddOneOut"
        component={OddOneOut}
        durationInFrames={240} // 8 sec @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          seed: 1,
          grid: 8,
          gap: 12,
          cellSize: 90,
          difficulty: "hard",
        }}
      />
      <Composition
        id="EyeTestBall"
        component={EyeTestBall}
        durationInFrames={420} // 14 sec @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          differences: 3,
          topImage: "puzzles/done/p42_3_top.png",
          bottomImage: "puzzles/done/p42_3_bottom.png",
        }}
      />
      <Composition
        id="EyeTestDailyTwitter"
        component={SpotTheDifferenceTwitter}
        durationInFrames={30} // 10 sec @ 30fps
        fps={30}
        width={1200}
        height={676}
        defaultProps={{
          differences: 3,
          topImage: "puzzles/done/p42_3_top.png",
          bottomImage: "puzzles/done/p42_3_bottom.png",
        }}
      />
      <Composition
        id="VideoWithTextOverlay"
        component={AiVideoTimelaps}
        durationInFrames={240} // 10 sec @ 24fps
        fps={24}
        width={1080}
        height={1920}
        schema={AiVideoTimelapsSchema}
        defaultProps={{
          videoUrl: "videos/tv-wall-media-unit-setup.mp4",
          noText: false,
          title: "Moon wall transformation",
          subtitle: "wait till you see the result",
          subtitleColor: "red",
          textHeight: 35,
          height: 65,
          zoom: 1.1,
        }}
      />
    </>
  );
};
