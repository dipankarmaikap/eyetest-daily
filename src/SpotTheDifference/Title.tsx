type Props = {
  differences: number;
};

export const Title: React.FC<Props> = ({ differences }) => {
  return (
    <div
      style={{
        textAlign: "center",
        color: "#000",
      }}
    >
      <h1
        style={{
          fontSize: 80,
          fontWeight: 800,
        }}
        className="bg-white rounded-full p-4"
      >
        Spot {differences} Differences
      </h1>
    </div>
  );
};
