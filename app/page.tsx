import { Audience } from "@/components/marketing/Audience";
import { Benefits } from "@/components/marketing/Benefits";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { MobileStickyCTA } from "@/components/marketing/MobileStickyCTA";
import { Plans } from "@/components/marketing/Plans";
import { Problem } from "@/components/marketing/Problem";
import { Testimonials } from "@/components/marketing/Testimonials";
import { WhyUs } from "@/components/marketing/WhyUs";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Problem />
        <Benefits />
        <Plans />
        <WhyUs />
        <Audience />
        <Testimonials />
        <HowItWorks />
        <FinalCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
