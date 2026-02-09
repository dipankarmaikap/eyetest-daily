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
      className="inline-flex"
    >
      <h1
        style={{
          fontSize: 65,
          fontWeight: 800,
        }}
        className="bg-white rounded-lg py-4 px-12"
      >
        Spot {differences} Differences
      </h1>
    </div>
  );
};
