-- PAGES
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  meta_description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "admin manage pages" ON public.pages FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- JOBS
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Full-time',
  location text,
  requirements text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "admin manage jobs" ON public.jobs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER pages_touch BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER jobs_touch BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ADMIN USERS
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
INSERT INTO public.admin_users (email, name, role, is_active)
VALUES ('uzairahmadtunio786@gmail.com', 'Uzair Ahmad', 'super_admin', true)
ON CONFLICT DO NOTHING;

-- SEED PAGES
INSERT INTO public.pages (slug, title, meta_description, content) VALUES
('about', 'About HBH Collection', 'HBH Collection — premium Pakistani clothing brand delivering quality T-shirts, jeans and shirts all over Pakistan at honest prices.',
'## Our Story
HBH Collection was founded with a single mission: to bring premium quality clothing to every Pakistani at honest prices. We believe that great style shouldn''t cost a fortune.

From our very first premium T-shirt to our growing collection of jeans, shirts, and more — every piece we design is crafted with care, tested for quality, and made to last.

We started small — just a TikTok page and a dream. Today, we deliver all across Pakistan, from Karachi to Gilgit, with thousands of happy customers who trust the HBH name.

This is just the beginning.'),
('faq', 'Frequently Asked Questions', 'Answers about HBH Collection orders, payment, delivery charges, returns, sizing and account questions.',
'## ORDERS & PAYMENT
Q: How do I place an order?
A: You can place an order directly on our website by selecting your size, color, and clicking "Add to Cart." Then proceed to checkout and fill in your delivery details. Alternatively, you can also order via WhatsApp at +92 311-2578079.

Q: What payment methods do you accept?
A: We accept:
• Cash on Delivery (COD) — pay when you receive
• JazzCash — send to 0311-2578079
• Easypaisa — send to 0330-2033640
• Bank Transfer — account details provided at checkout
For JazzCash/Easypaisa payments, please send a screenshot to our WhatsApp as confirmation.

Q: Can I cancel my order?
A: Yes, you can cancel your order within 2 hours of placing it. After 2 hours, if your order has been dispatched, cancellation is not possible. Contact us on WhatsApp immediately to request a cancellation.

Q: How do I track my order?
A: Once your order is dispatched, you will receive a tracking number via WhatsApp. You can also track your order on our website at hbhcollection.com/track using your order number (HBH-XXXXXX).

Q: I placed an order but haven''t received a confirmation. What should I do?
A: Please check your spam/junk folder first. If you still haven''t received confirmation, WhatsApp us at +92 311-2578079 with your name and phone number and we''ll look into it.

## DELIVERY & SHIPPING
Q: How long does delivery take?
A: Standard delivery times:
• Karachi, Lahore, Islamabad: 2-3 working days
• Other major cities: 3-4 working days
• Remote areas: 5-7 working days
Note: These are estimates and may vary due to courier delays.

Q: What are the delivery charges?
A: Delivery charges depend on your province:
• Punjab & Islamabad: PKR 150
• Sindh: PKR 180
• KPK: PKR 200
• Balochistan & FATA: PKR 250
• AJK & Gilgit-Baltistan: PKR 300
FREE delivery on orders above PKR 2,000!

Q: Do you deliver all over Pakistan?
A: Yes! We deliver to all cities and areas across Pakistan through our trusted courier partners.

Q: My order shows delivered but I haven''t received it. What do I do?
A: Please contact us immediately on WhatsApp at +92 311-2578079 with your order number. We will investigate with the courier and resolve it within 48 hours.

## RETURNS & EXCHANGE
Q: What is your return policy?
A: We offer a 7-day easy return and exchange policy from the date of delivery. Items must be unused, unwashed, and in original condition with tags attached.

Q: How do I return or exchange an item?
A: WhatsApp us at +92 311-2578079 with:
1. Your order number (HBH-XXXXXX)
2. Reason for return/exchange
3. Photo of the item
We will guide you through the process.

Q: Do I have to pay for return shipping?
A: If the item is defective or incorrect, we cover the return shipping cost. For size exchange or change of mind, the customer pays return shipping.

Q: When will I get my refund?
A: Refunds are processed within 3-5 working days after we receive the returned item. Refunds are sent via the same payment method used.

## PRODUCTS & SIZING
Q: How do I choose the right size?
A: Check our size guide on each product page. Our sizes generally follow standard Pakistani sizing. If you''re between sizes, we recommend going one size up. You can also WhatsApp us your measurements and we''ll help you pick the right size.

Q: Are your products original/genuine?
A: Yes, 100%. All HBH Collection products are our own brand, designed and quality-checked by our team. We do not sell replicas or low-quality copies.

Q: Will the color look exactly like the picture?
A: We try our best to represent colors accurately. However, slight variations may occur due to screen settings. If you have concerns, WhatsApp us and we''ll send additional photos.

Q: Do you restock sold-out items?
A: Yes, popular items are restocked regularly. Follow us on TikTok @hbh.collection or WhatsApp us to be notified when your desired item is back in stock.

## ACCOUNT & WEBSITE
Q: Do I need an account to order?
A: No, you can checkout as a guest. However, creating an account lets you track orders, save your address, and view order history easily.

Q: Is my personal information safe?
A: Absolutely. We do not share your personal information with third parties. See our Privacy Policy for full details.'),
('privacy-policy', 'Privacy Policy', 'How HBH Collection collects, uses and protects your personal information.',
'_Last Updated: July 2025_

At HBH Collection, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.

## 1. INFORMATION WE COLLECT
We collect the following information when you place an order or create an account:
• Full name
• Phone number / WhatsApp number
• Email address (optional)
• Delivery address
• Order history
• Payment method (we do NOT store card or account numbers)

## 2. HOW WE USE YOUR INFORMATION
We use your information to:
• Process and deliver your orders
• Send order confirmations and updates
• Respond to your questions and complaints
• Improve our products and services
• Send promotional messages (only if you have opted in)

## 3. INFORMATION SHARING
We do NOT sell or share your personal information with third parties, except:
• Courier companies (for delivery purposes only)
• Payment processors (JazzCash/Easypaisa — they have their own privacy policies)
We share only the minimum information required to complete your order.

## 4. DATA SECURITY
We take reasonable steps to protect your information from unauthorized access, loss, or misuse. Our website uses secure connections (HTTPS).

## 5. COOKIES
Our website uses cookies to improve your browsing experience and remember your cart items. You can disable cookies in your browser settings, but some website features may not work properly.

## 6. MARKETING COMMUNICATIONS
If you have opted in to receive marketing messages, we may contact you via WhatsApp about new arrivals, sales, and offers. You can opt out at any time by replying "STOP" to any message.

## 7. YOUR RIGHTS
You have the right to:
• Request access to your personal data
• Request correction of incorrect data
• Request deletion of your account and data
• Opt out of marketing communications
To exercise these rights, contact us at hbhcollection@gmail.com

## 8. CHILDREN''S PRIVACY
Our website is not intended for children under 13. We do not knowingly collect information from children.

## 9. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. We will notify customers of significant changes via WhatsApp or email.

## 10. CONTACT US
For privacy-related questions:
WhatsApp: +92 311-2578079
Email: hbhcollection@gmail.com'),
('terms', 'Terms & Conditions', 'The terms and conditions that apply when you shop with HBH Collection in Pakistan.',
'_Last Updated: July 2025_

By using the HBH Collection website and placing orders, you agree to these Terms.

## 1. GENERAL
• HBH Collection is a Pakistani clothing brand selling premium T-shirts, jeans, and more.
• These terms apply to all users of our website and customers who place orders.
• We reserve the right to update these terms at any time without prior notice.

## 2. PRODUCTS & PRICING
• All prices are in Pakistani Rupees (PKR).
• Prices may change without notice. The price at time of order is final.
• Product images are for illustration. Actual colors may slightly vary.
• We reserve the right to discontinue any product at any time.

## 3. ORDERING
• By placing an order, you confirm that the information you have provided is accurate and complete.
• An order confirmation does not guarantee availability. If an item is out of stock after you order, we will contact you to offer an alternative or refund.
• We reserve the right to cancel any order in case of pricing errors or fraud.

## 4. PAYMENT
• Payment must be made using the methods shown at checkout.
• For COD orders, payment is due at delivery.
• For digital payments (JazzCash/Easypaisa), proof of payment must be sent to our WhatsApp.
• Orders are confirmed only after payment verification for digital payments.

## 5. DELIVERY
• We aim to deliver within the stated timeframes but cannot guarantee exact dates.
• Delivery delays due to courier issues, weather, or force majeure are not our responsibility.
• If no one is available to receive the order, the courier will attempt delivery again. After 3 failed attempts, the order may be returned to us.

## 6. RETURNS & EXCHANGES
• See our Returns & Exchange Policy page for full details.
• Items must be returned in original condition within 7 days of delivery.
• We do not accept returns on sale items unless defective.

## 7. INTELLECTUAL PROPERTY
• All content on this website including logos, images, designs, and text belongs to HBH Collection and may not be copied or used without permission.

## 8. LIMITATION OF LIABILITY
• HBH Collection is not liable for any indirect or consequential losses arising from use of our products or website.
• Our maximum liability is limited to the value of the item(s) purchased.

## 9. GOVERNING LAW
• These terms are governed by the laws of Pakistan.

## 10. CONTACT
Questions about these terms:
WhatsApp: +92 311-2578079
Email: hbhcollection@gmail.com'),
('shipping', 'Shipping & Delivery', 'HBH Collection delivery charges, timelines and courier partners for every province of Pakistan.',
'## Important Notes
• Orders are processed Monday to Saturday.
• Orders placed on Sunday or public holidays are processed the next working day.
• Delivery times are estimates and may vary due to courier conditions, especially during Eid, Ramzan, or peak seasons.
• We use trusted courier partners (TCS, Leopards, M&P, BlueEx) for reliable delivery.
• You will receive your tracking number via WhatsApp once dispatched.'),
('returns', 'Returns & Exchange Policy', '7-day easy returns and exchanges on HBH Collection orders across Pakistan.',
'## Refund Methods
• JazzCash / Easypaisa — within 3 days
• Bank Transfer — within 5 days
• Store Credit — immediate (can use on next order)
Note: Original delivery charges are non-refundable unless the item was defective or incorrect.

## Exchange Policy
• We offer size exchanges on all products.
• If the new size costs more, you pay the difference.
• If it costs less, we refund the difference.
• For exchanges, you pay return shipping. We cover reshipping of the new item.

## Defective Items
If you receive a defective, damaged, or incorrect item:
• We cover ALL shipping costs for the return.
• You get a full refund OR replacement at no extra charge.
• Priority processing within 48 hours.'),
('careers', 'Careers at HBH Collection', 'Join the HBH Collection team — remote and on-site roles in social media, customer support and delivery coordination.',
'## Internships
We also offer internships for students interested in fashion, e-commerce, digital marketing, and web development. Contact us to know about current openings.

## How to Apply
Interested? Send us your CV/portfolio:
WhatsApp: +92 311-2578079
Email: hbhcollection@gmail.com
Subject: "Application — [Position Name]"');

-- SEED JOBS
INSERT INTO public.jobs (title, type, location, requirements, display_order) VALUES
('Social Media Manager', 'Full-time / Freelance', 'Remote — Pakistan', E'Experience with TikTok and Instagram\nContent creation skills\nUnderstanding of fashion trends\nGood communication skills', 1),
('Customer Support Representative', 'Part-time / Full-time', 'Remote — Pakistan', E'Excellent WhatsApp communication\nPatient and professional attitude\nAbility to handle order queries\nAvailable 10 AM – 10 PM', 2),
('Delivery Coordinator', 'Part-time', 'Lahore / Karachi', E'Experience with courier coordination\nOrganized and detail-oriented\nStrong communication skills', 3);