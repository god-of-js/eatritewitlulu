import { Container } from "@/components/ui/Container";

const benefits = [
  {
    icon: "🍽️",
    title: "Ready-to-Eat Convenience",
    copy: "Meals are prepared so you spend less time cooking and more time living.",
  },
  {
    icon: "🎯",
    title: "Meals Built Around Your Goals",
    copy: "Choose meals designed around healthier everyday eating or higher-protein lifestyles.",
  },
  {
    icon: "🥗",
    title: "Delicious & Balanced",
    copy: "Healthy doesn't have to mean boring. Meals should be satisfying, enjoyable and something you actually look forward to eating.",
  },
];

export function Benefits() {
  return (
    <section id="solution" className="bg-ink py-20 text-cream md:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage">
            The difference
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight text-white sm:text-5xl">
            We Make Healthy Eating Easier.
          </h2>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-3xl border border-white/8 bg-white/4 p-7"
            >
              <span className="text-2xl" aria-hidden>
                {benefit.icon}
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {benefit.copy}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
