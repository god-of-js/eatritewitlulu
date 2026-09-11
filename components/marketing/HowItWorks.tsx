import { Container } from "@/components/ui/Container";

const steps = [
  {
    number: "01",
    title: "Choose Your Plan",
    copy: "Pick the meal plan that best fits your lifestyle.",
  },
  {
    number: "02",
    title: "Choose Delivery",
    copy: "Pick how often you want meals delivered and whether you are on the Island or Mainland.",
  },
  {
    number: "03",
    title: "Pay & Get Your Meals",
    copy: "Review your total, pay securely, and we arrange your deliveries.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-cream py-20 text-ink md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
            Choose a plan. Pay online. Eat well.
          </h2>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="relative rounded-[1.75rem] border border-ink/8 bg-white p-7"
            >
              <span className="font-display text-4xl italic text-sage/70">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {step.copy}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <a
            href="#plans"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-8 text-sm font-semibold text-cream transition-colors hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
          >
            Choose Your Plan
          </a>
        </div>
      </Container>
    </section>
  );
}
