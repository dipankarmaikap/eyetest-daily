import "./index.css";
import { Composition } from "remotion";
import { SpotTheDifference } from "./SpotTheDifference";

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
    </>
  );
};
