import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/923112578079"
      target="_blank"
      rel="noreferrer"
      title="Order via WhatsApp 📦"
      aria-label="Order via WhatsApp"
      className="group fixed bottom-5 right-5 z-90 flex items-center gap-2 rounded-full bg-success px-4 py-3.5 text-background shadow-2xl transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="heading hidden text-[10px] tracking-[0.2em] sm:inline">
        ORDER VIA WHATSAPP
      </span>
    </a>
  );
}
