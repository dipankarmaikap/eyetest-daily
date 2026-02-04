export type ShapeType =
  | "square"
  | "circle"
  | "diamond"
  | "hexagon"
  | "star"
  | "triangle";

const getShapeStyles = (
  shape: ShapeType,
  size: number,
  color: string,
): React.CSSProperties => {
  const base: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: color,
  };

  switch (shape) {
    case "circle":
      return { ...base, borderRadius: "50%" };

    case "diamond":
      return {
        ...base,
        transform: "rotate(45deg) scale(0.7)",
        borderRadius: 8,
      };

    case "hexagon":
      return {
        ...base,
        clipPath:
          "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      };

    case "star":
      return {
        ...base,
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      };

    case "triangle":
      return {
        ...base,
        clipPath: "polygon(50% 10%, 100% 90%, 0% 90%)",
      };

    case "square":
    default:
      return { ...base, borderRadius: 14 };
  }
};

export const GridCell = ({
  size,
  color,
  highlight = false,
  shape = "square",
}: {
  size: number;
  color: string;
  highlight?: boolean;
  shape?: ShapeType;
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...getShapeStyles(shape, size, color),
          boxShadow: highlight
            ? `0 0 0 4px white, 0 0 20px 8px ${color}`
            : "0 2px 8px rgba(0,0,0,0.1)",
          transition: "box-shadow 0.2s",
        }}
      />
    </div>
  );
};
