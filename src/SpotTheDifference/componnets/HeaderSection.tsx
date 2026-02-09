import { Title } from "../Title";

export default function HeaderSection({
  differences,
  showLikeButton,
}: {
  differences: number;
  showLikeButton: boolean;
}) {
  return (
    <>
      <div className="text-center">
        <Title differences={differences} />
      </div>
      {showLikeButton && (
        <div className="text-center">
          <div className="bg-white inline-flex items-center justify-center rounded-full mt-6">
            <p className="px-8 py-2 font-semibold" style={{ fontSize: 40 }}>
              Found it? Double tap ❤️
            </p>
          </div>
        </div>
      )}
    </>
  );
}
