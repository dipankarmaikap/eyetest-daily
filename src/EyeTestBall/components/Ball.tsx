import { AbsoluteFill } from "remotion";

export const Ball = ({ x, y }: { x: number; y: number }) => {
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: 80,
        height: 80,
        borderRadius: "50%",
        backgroundColor: "#fe6f13",
      }}
    />
  );
};
