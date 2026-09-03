import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { testimonials } from "@/lib/testimonials";
import { getGeneralWhatsAppUrl } from "@/lib/whatsapp";

export function Testimonials() {
  return (
    <section id="stories" className="bg-charcoal py-20 text-cream md:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage">
            Social proof
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight text-white sm:text-5xl">
            From people who eat with us
          </h2>
        </div>

        {testimonials.length > 0 ? (
          <ul className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <li
                key={`${item.name}-${item.quote.slice(0, 24)}`}
                className="rounded-[1.75rem] border border-white/8 bg-white/4 p-7"
              >
                <blockquote>
                  <p className="font-display text-xl leading-relaxed italic text-white">
                    “{item.quote}”
                  </p>
                  <footer className="mt-6 text-sm text-white/60">
                    — {item.name}
                    {item.role ? (
                      <span className="block text-white/40">{item.role}</span>
                    ) : null}
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12 max-w-2xl rounded-[2rem] border border-white/10 bg-white/4 p-8 sm:p-10">
            <p className="font-display text-2xl leading-snug italic text-white">
              Real stories belong here — and we won&apos;t invent them.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              This section is ready for customer quotes. When people share how
              EatriteWithLulu made healthy eating easier, their words will
              appear here.
            </p>
            <WhatsAppLink
              href={getGeneralWhatsAppUrl()}
              variant="secondary"
              className="mt-7"
            >
              <WhatsAppIcon />
              Tell us your experience
            </WhatsAppLink>
          </div>
        )}
      </Container>
    </section>
  );
}
