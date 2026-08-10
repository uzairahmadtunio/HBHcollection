import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { settingsQuery } from "@/lib/data";
import { waLink } from "@/lib/shop";
import { PaymentBadges, TrustBadge } from "./PaymentBadges";

export function Footer() {
  const { data: s } = useQuery(settingsQuery);
  const settings = s ?? {};

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="display text-4xl text-gold">HBH</span>
            <span className="heading text-[10px] tracking-[0.35em] text-primary">COLLECTION</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {settings.tagline ?? "Premium Fashion. All Pakistan Delivery."}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{settings.specialty}</p>
        </div>

        <div>
          <h3 className="heading gold-rule mb-4 text-xs tracking-[0.2em]">SHOP</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/men" className="hover:text-gold">Men</Link></li>
            <li><Link to="/women" className="hover:text-gold">Women</Link></li>
            <li><Link to="/kids" className="hover:text-gold">Kids</Link></li>
            <li><Link to="/sale" className="hover:text-gold">Sale</Link></li>
            <li><Link to="/new-arrivals" className="hover:text-gold">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="heading gold-rule mb-4 text-xs tracking-[0.2em]">HELP</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/track" className="hover:text-gold">Track Order</Link></li>
            <li><Link to="/shipping" className="hover:text-gold">Shipping &amp; Delivery</Link></li>
            <li><Link to="/returns" className="hover:text-gold">Returns &amp; Exchange</Link></li>
            <li><Link to="/faq" className="hover:text-gold">FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
            <li><Link to="/account" className="hover:text-gold">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="heading gold-rule mb-4 text-xs tracking-[0.2em]">COMPANY</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-gold">Careers</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-gold">Terms &amp; Conditions</Link></li>
          </ul>
        </div>


        <div>
          <h3 className="heading gold-rule mb-4 text-xs tracking-[0.2em]">CONTACT</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-gold" />
              <a href={waLink("Hi HBH Collection!")} className="hover:text-gold">
                WhatsApp {settings.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold" /> {settings.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold" /> {settings.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-gold" /> {settings.address}
            </li>
          </ul>
          {settings.tiktok && (
            <a
              href={settings.tiktok}
              target="_blank"
              rel="noreferrer"
              className="heading mt-4 inline-block border border-gold px-3 py-1.5 text-[10px] tracking-[0.2em] text-gold hover:bg-gold hover:text-background"
            >
              TIKTOK @HBH.COLLECTION
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-border py-6">
        <div className="mx-auto max-w-7xl px-4">
          <PaymentBadges />
          <TrustBadge />
        </div>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HBH Collection. All rights reserved.
          <p className="mt-2 text-[10px] text-muted-foreground/80">
            Developed by Uzair Ahmad | SE Student, University of Larkana | +923064379361
          </p>
        </div>
      </div>
    </footer>
  );
}
