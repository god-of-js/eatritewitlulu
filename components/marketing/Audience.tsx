import { Container } from "@/components/ui/Container";

const audiences = [
  {
    title: "Busy Professionals",
    copy: "For people who want to eat better without spending hours in the kitchen.",
  },
  {
    title: "Fitness Enthusiasts",
    copy: "For people looking for convenient, protein-focused meals.",
  },
  {
    title: "People Trying to Eat Healthier",
    copy: "For anyone who wants better meals and more consistency.",
  },
  {
    title: "People Who Hate Meal Prep",
    copy: "For anyone who would rather have their meals handled for them.",
  },
];

export function Audience() {
  return (
    <section id="who" className="bg-cream py-20 text-ink md:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
            Who it&apos;s for
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
            Built For Your Lifestyle
          </h2>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {audiences.map((audience) => (
            <li
              key={audience.title}
              className="rounded-[1.75rem] border border-ink/8 bg-white p-7"
            >
              <h3 className="text-xl font-semibold tracking-tight">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {audience.copy}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
