type LogoProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function Logo({ className = "", tone = "light" }: LogoProps) {
  const colors =
    tone === "light" ? "text-white" : "text-ink";

  return (
    <a
      href="#top"
      className={`inline-flex items-center gap-2.5 ${colors} ${className}`}
      aria-label="EatriteWithLulu home"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full border border-current/25"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M8 4v7c0 1.4-.8 2-2 2" />
          <path d="M8 4v16" />
          <path d="M6 4v4" />
          <path d="M10 4v4" />
          <path d="M16 4c2.2 0 3 1.6 3 4s-.8 4-3 4" />
          <path d="M16 12v8" />
        </svg>
      </span>
      <span className="text-[15px] font-medium tracking-tight">
        Eatrite
        <span className="font-display italic font-normal">WithLulu</span>
      </span>
    </a>
  );
}
