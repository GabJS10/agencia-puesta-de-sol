import { ReviewCard } from "./ReviewCard";
import { Review } from "@/types/Reviews";

export function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <section className="bg-noche px-4 py-24 text-arena md:px-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Lo que viven nuestros viajeros
          </p>
          <h2 className="font-display text-3xl font-medium italic leading-[1.2] md:text-4xl">
            &ldquo;El desierto y el mar no se cuentan, se viven.&rdquo;
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
}
