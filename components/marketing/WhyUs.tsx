import { Container } from "@/components/ui/Container";

const reasons = [
  {
    title: "Convenient",
    copy: "No shopping. No meal prep. No daily cooking decisions.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
  },
  {
    title: "Goal-Focused",
    copy: "Meals designed to support healthier eating and active lifestyles.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Freshly Prepared",
    copy: "Meals prepared with quality ingredients and attention to taste.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 20c4-3.2 6-6.4 6-9.2C18 7.2 15.3 5 12 5S6 7.2 6 10.8C6 13.6 8 16.8 12 20Z" />
        <path d="M12 11.5c.8 0 1.5-.8 1.5-1.7 0-1.2-1.5-2.3-1.5-2.3S10.5 8.6 10.5 9.8c0 .9.7 1.7 1.5 1.7Z" />
      </svg>
    ),
  },
  {
    title: "Consistent",
    copy: "Make healthy eating easier to maintain throughout the week.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 10h16M8 3v4M16 3v4" />
      </svg>
    ),
  },
];

export function WhyUs() {
  return (
    <section id="why" className="bg-ink py-20 text-cream md:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage">
            Why EatriteWithLulu
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight text-white sm:text-5xl">
            Healthy Eating That Fits Into Real Life.
          </h2>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/8 bg-white/8 sm:grid-cols-2">
          {reasons.map((reason) => (
            <li key={reason.title} className="bg-ink p-7 sm:p-8">
              <div
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-sage/40 text-sage"
                aria-hidden
              >
                {reason.icon}
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {reason.copy}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
