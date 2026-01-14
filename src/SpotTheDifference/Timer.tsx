type Props = {
  frame: number;
  totalFrames: number;
  seconds: number;
};

export const Timer: React.FC<Props> = ({ frame, totalFrames, seconds }) => {
  const progress = frame / totalFrames;
  const remaining = Math.max(0, Math.ceil(seconds * (1 - progress)));

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        right: 40,
        background: "#020617",
        color: "#fff",
        padding: "16px 24px",
        borderRadius: 999,
        fontSize: 32,
        fontWeight: 700,
      }}
    >
      ⏱ {remaining}s
    </div>
  );
};
