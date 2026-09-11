import Link from "next/link";
import { buttonClass } from "@/components/ui/ButtonLink";

export function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur-md md:hidden">
      <Link href="/#plans" className={buttonClass("primary", "w-full")}>
        Subscribe to a plan
      </Link>
    </div>
  );
}
