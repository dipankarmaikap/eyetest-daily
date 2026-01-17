import { z } from "zod";
import { AbsoluteFill, Html5Video, staticFile } from "remotion";

export const AiVideoTimelapsSchema = z.object({
  videoUrl: z.string(),
  audioUrl: z.string().optional(),
  title: z.string(),
  subtitle: z.string(),
  subtitleColor: z.string(),
  height: z.number(),
});

export const AiVideoTimelaps: React.FC<
  z.infer<typeof AiVideoTimelapsSchema>
> = ({ videoUrl, title, subtitle, subtitleColor, height }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "black",
      }}
    >
      {/* Top text area (20%) */}
      <div
        style={{
          height: "25%",
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

      <div
        style={{
          height: `${height}%`,
          overflow: "hidden", // IMPORTANT
        }}
      >
        <Html5Video
          src={staticFile(videoUrl)}
          playbackRate={0.5}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover", // zoom + side crop
            objectPosition: "bottom center",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
