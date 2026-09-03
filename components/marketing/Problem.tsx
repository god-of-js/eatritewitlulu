import Image from "next/image";
import { Container } from "@/components/ui/Container";

const pains = [
  {
    title: "No time to cook",
    copy: "Work, family and life already fill the day. Cooking from scratch every night is the first thing to slip.",
  },
  {
    title: "Tired of deciding what to eat",
    copy: "Decision fatigue is real. Another evening spent wondering what is healthy enough — and still doable.",
  },
  {
    title: "Struggling to stay consistent",
    copy: "A good week is easy. The hard part is repeating it when energy is low and takeout is closer.",
  },
  {
    title: "Finding meals that taste good",
    copy: "Healthy should still be something you look forward to. Bland food is why most plans do not last.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="bg-cream py-20 text-ink md:py-28">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
              The problem
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
              Eating Healthy Shouldn&apos;t Be This Hard.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/70 sm:text-lg">
              <p>
                Planning what to eat every day takes time. Shopping, cooking,
                measuring portions and trying to stay consistent can quickly
                become exhausting.
              </p>
              <p>
                EatriteWithLulu takes the guesswork out of healthy eating by
                giving you convenient, thoughtfully planned meals that fit your
                goals and lifestyle.
              </p>
            </div>
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] lg:block">
            <Image
              src="/images/produce.jpg"
              alt="Avocado toast with soft-boiled eggs on a dark plate"
              fill
              sizes="40vw"
              className="object-cover"
            />
          </div>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {pains.map((pain, index) => (
            <li
              key={pain.title}
              className="rounded-3xl border border-ink/8 bg-white/70 p-6 shadow-[0_1px_0_rgba(12,12,12,0.04)]"
            >
              <span className="font-display text-sm italic text-sage-deep">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {pain.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {pain.copy}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
