import { Title } from "../Title";

export default function HeaderSection({
  title,
  showLikeButton,
  cta,
}: {
  title: string;
  showLikeButton: boolean;
  cta: string;
}) {
  return (
    <>
      <div className="text-center">
        <Title title={title} />
      </div>
      {showLikeButton && (
        <div className="text-center">
          <div className="bg-white/80 inline-flex items-center justify-center rounded-full mt-6">
            <p className="px-8 py-2 font-semibold" style={{ fontSize: 40 }}>
              {cta}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
