import { z } from "zod";
import { AbsoluteFill, Html5Video, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();
export const AiVideoTimelapsSchema = z.object({
  videoUrl: z.string(),
  noText: z.boolean(),
  audioUrl: z.string().optional(),
  title: z.string(),
  subtitle: z.string(),
  subtitleColor: z.string(),
  height: z.number(),
  textHeight: z.number(),
  zoom: z.number(),
  trimBefore: z.number(),
});

export const AiVideoTimelaps: React.FC<
  z.infer<typeof AiVideoTimelapsSchema>
> = ({
  videoUrl,
  title,
  subtitle,
  subtitleColor,
  height,
  textHeight,
  zoom,
  noText,
  trimBefore,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "black",
      }}
    >
      {!noText && title && (
        <div
          style={{
            height: `${textHeight}%`,
            display: "flex",
            padding: "220px 40px",
            textAlign: "center",
            fontSize: 64,
            fontWeight: 800,
            color: "white",
          }}
        >
          <div className="flex flex-col items-start justify-start">
            <p>"{title}</p>
            <p>
              <span className="text-blue-500" style={{ color: subtitleColor }}>
                {subtitle}{" "}
              </span>
              🥰"
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          height: `${noText ? 100 : height}%`,
          overflow: "hidden", // IMPORTANT
        }}
      >
        <Html5Video
          src={staticFile(videoUrl)}
          playbackRate={0.5}
          muted
          trimBefore={trimBefore}
          style={{
            transform: `scale(${zoom})`, // zoom in
            width: "100%",
            height: "100%",
            objectFit: "cover", // zoom + side crop
            objectPosition: "center center",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          opacity: 0.2,
          fontSize: 40,
          fontWeight: 400,
          display: "flex",
          color: "white",
          fontFamily,
        }}
      >
        @stillmotion.frames
      </div>
    </AbsoluteFill>
  );
};
