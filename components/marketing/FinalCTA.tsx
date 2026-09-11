import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function FinalCTA() {
  return (
    <section
      id="get-started"
      className="relative overflow-hidden py-28 text-center text-white md:py-36"
    >
      <Image
        src="/images/cta.jpg"
        alt="A beautifully plated meal on a dark table"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

      <div className="relative z-10 mx-auto max-w-2xl px-5 sm:px-8">
        <h2 className="font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl md:text-6xl">
          Your Next Healthy Meal Is One Plan Away.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/75">
          Stop stressing about what to eat. Choose your plan, set delivery and
          subscribe directly on EatriteWithLulu.
        </p>
        <ButtonLink href="/#plans" variant="primary" className="mt-8 px-8">
          Subscribe to a plan
        </ButtonLink>
      </div>
    </section>
  );
}
