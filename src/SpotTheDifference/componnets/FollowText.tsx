import { followText } from "../utils";

export default function FollowText() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 25,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 40,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 2,
        color: "white",
        letterSpacing: 2,
        whiteSpace: "nowrap",
      }}
    >
      {followText}
    </div>
  );
}
