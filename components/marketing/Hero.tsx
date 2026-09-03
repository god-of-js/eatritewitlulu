import Image from "next/image";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { getGeneralWhatsAppUrl } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      <Image
        src="/images/hero.jpg"
        alt="Fresh vegetables, herbs and healthy ingredients arranged on a dark surface"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-ink" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-28 text-center sm:px-8">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cream/80">
          Healthy meals, planned for you
        </p>
        <h1 className="font-display text-[2.35rem] leading-[1.08] font-medium tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
          Eat Better. Feel Better.
          <span className="block italic text-cream">Reach Your Goals.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          Delicious, thoughtfully prepared meals designed to make healthy eating
          easier, more convenient and more consistent.
        </p>
        <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <a
            href="#plans"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-cream px-8 text-sm font-semibold text-ink shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
          >
            Explore Meal Plans
          </a>
          <WhatsAppLink href={getGeneralWhatsAppUrl()} variant="secondary">
            <WhatsAppIcon />
            Chat With Us
          </WhatsAppLink>
        </div>
      </div>
    </section>
  );
}
