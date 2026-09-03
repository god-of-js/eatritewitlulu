import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { getGeneralWhatsAppUrl } from "@/lib/whatsapp";

export function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur-md md:hidden">
      <a
        href={getGeneralWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white"
      >
        <WhatsAppIcon />
        Get Started on WhatsApp
      </a>
    </div>
  );
}
