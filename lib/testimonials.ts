export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "The food actually tastes amazing. I stopped forcing myself through bland 'healthy' meals. I look forward to lunch now.",
    name: "Chioma A.",
    role: "Standard Weekday Plan",
  },
  {
    quote:
      "I lost 2kg in my first week without starving myself. Portions are right, and I finally stopped guessing what to eat.",
    name: "Tolu M.",
    role: "High-Protein OMAD 1 Plan",
  },
  {
    quote:
      "Training got easier once the meals were handled. High protein, ready when I need it, and I don't think about cooking after the gym.",
    name: "David K.",
    role: "High-Protein All Inclusive Plan",
  },
  {
    quote:
      "I used to waste every evening deciding what to cook. Now I just heat my meal and get on with my life. Consistency is finally easy.",
    name: "Amaka E.",
    role: "Standard Lunch Extra 1 Plan",
  },
  {
    quote:
      "I hate meal prep, and I was tired of takeout. EatriteWithLulu gave me proper meals without the stress. I've stayed on track for a month.",
    name: "Kunle B.",
    role: "Standard All Inclusive Plan",
  },
];
