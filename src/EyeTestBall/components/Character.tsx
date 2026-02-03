import { AbsoluteFill, Img, staticFile } from "remotion";

export const Character = ({
  x,
  y,
}: {
  x: number;
  y: number;
  color: string;
  label: string;
}) => {
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: 300,
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 72,
        fontWeight: 700,
        color: "#fff",
      }}
    >
      <Img src={staticFile("cute-red-panda.png")} />
    </AbsoluteFill>
  );
};
