import "./index.css";
import { Composition } from "remotion";
import { SpotTheDifference } from "./SpotTheDifference";
import { AiVideoTimelaps, AiVideoTimelapsSchema } from "./AiVideoTimelaps";

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
          topImage: "spot_diff_01_v1.png",
          bottomImage: "spot_diff_01_v2.png",
        }}
      />
      <Composition
        id="VideoWithTextOverlay"
        component={AiVideoTimelaps}
        durationInFrames={450} // 20 sec @ 30fps
        fps={30}
        width={1080}
        height={1920}
        schema={AiVideoTimelapsSchema}
        defaultProps={{
          videoUrl: "videos/Abandoned_House_Becomes_Luxury_Home.mp4",
          title: "Moon wall transformation",
          subtitle: "wait till you see the result",
          subtitleColor: "red",
          height: 65,
        }}
      />
    </>
  );
};
