import type { Metadata } from "next";
import { FaqList } from "@/components/marketing/FaqList";
import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";
import { Container } from "@/components/ui/Container";
import { aboutContent } from "@/lib/about";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how EatriteWithLulu started, what we aim to achieve, and answers to common questions about meal plans and delivery.",
};

export default function AboutPage() {
  return (
    <>
      <Header variant="solid" />
      <main id="main" className="bg-cream text-ink">
        <section className="pt-28 pb-16 md:pt-36 md:pb-20">
          <Container>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
              {aboutContent.heroEyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
              {aboutContent.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">
              {aboutContent.heroCopy}
            </p>
          </Container>
        </section>

        <section className="pb-16 md:pb-24">
          <Container>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              {aboutContent.storyTitle}
            </h2>
            <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-ink/70">
              {aboutContent.story.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-cream-deep py-16 md:py-24">
          <Container>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              {aboutContent.goalsTitle}
            </h2>
            <ul className="mt-10 grid gap-5 md:grid-cols-2">
              {aboutContent.goals.map((goal) => (
                <li
                  key={goal.title}
                  className="rounded-[1.75rem] border border-ink/8 bg-white p-7"
                >
                  <h3 className="text-xl font-semibold tracking-tight">
                    {goal.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {goal.copy}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section id="faq" className="py-16 md:py-24">
          <Container>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
              FAQ
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Questions people ask
            </h2>
            <div className="mt-10">
              <FaqList />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
