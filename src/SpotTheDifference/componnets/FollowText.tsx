export default function FollowText({ followText }: { followText: string }) {
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
      <div className="bg-white/40 px-2 rounded-lg text-neutral-800">
        {followText}
      </div>
    </div>
  );
}
