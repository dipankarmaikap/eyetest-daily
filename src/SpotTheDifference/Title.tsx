type Props = {
  title: string;
};

export const Title: React.FC<Props> = ({ title }) => {
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
        className="bg-white/80 rounded-lg py-4 px-12"
      >
        {title}
      </h1>
    </div>
  );
};
