import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { waLink } from "@/lib/shop";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact HBH Collection — Pakistan" },
      { name: "description", content: "Questions about sizing, orders or delivery? Message HBH Collection on WhatsApp or email." },
      { property: "og:title", content: "Contact HBH Collection" },
      { property: "og:description", content: "Reach our team on WhatsApp or email — we reply fast." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("contact_messages").insert({
      sender_name: f.name,
      sender_email: f.email,
      subject: f.subject || null,
      message: f.phone ? `${f.message}\n\nPhone: ${f.phone}` : f.message,
    });
    if (error) return toast.error("Could not send. Please WhatsApp us instead.");
    toast.success("Message sent — we'll reply soon!");
    setF({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="display gold-rule mb-8 text-5xl">GET IN TOUCH</h1>
      <div className="grid gap-10 lg:grid-cols-2">
        <form onSubmit={send} className="space-y-4">
          <input required value={f.name} onChange={set("name")} placeholder="Your name" className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold" />
          <input required type="email" value={f.email} onChange={set("email")} placeholder="Email" className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold" />
          <input value={f.phone} onChange={set("phone")} placeholder="Phone (optional)" className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold" />
          <input value={f.subject} onChange={set("subject")} placeholder="Subject" className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold" />
          <textarea required rows={5} value={f.message} onChange={set("message")} placeholder="How can we help?" className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold" />
          <button className="heading w-full bg-primary py-4 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover">SEND MESSAGE</button>
        </form>

        <div className="space-y-4 text-sm">
          <a href={waLink("Hi HBH Collection!")} target="_blank" rel="noreferrer" className="flex items-center gap-3 border border-border bg-surface p-5 hover:border-success">
            <MessageCircle className="h-5 w-5 text-success" /> WhatsApp us — fastest reply
          </a>
          <div className="flex items-center gap-3 border border-border bg-surface p-5">
            <Mail className="h-5 w-5 text-gold" /> info@hbhcollection.pk
          </div>
          <div className="flex items-center gap-3 border border-border bg-surface p-5">
            <MapPin className="h-5 w-5 text-gold" /> Delivering all over Pakistan
          </div>
        </div>
      </div>
    </main>
  );
}
