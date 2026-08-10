# HBH Elevated

Act as a world-class full-stack developer and UI/UX designer.

Build a COMPLETE premium clothing brand eCommerce website 

for "HBH Collection" — a Pakistani fashion brand selling 

premium T-Shirts, Jeans, Shirts and more with delivery 

all over Pakistan.



This must look and feel like a premium international 

clothing brand website (think: H&M, ZARA, Khaadi level 

quality) but with Pakistani ordering system (WhatsApp + 

JazzCash/Easypaisa).



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 DESIGN SYSTEM:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



CSS Variables (all in one file — easy to change):

--color-bg: #0A0A0A (deep matte black)

--color-surface: #111111 (card bg)

--color-surface-2: #1A1A1A (elevated cards)

--color-primary: #CC0000 (brand red)

--color-primary-hover: #AA0000

--color-gold: #C9A84C (premium gold accent)

--color-text: #FFFFFF (primary text)

--color-text-muted: #888888

--color-border: #222222

--color-success: #22C55E



Typography:

- Headings: "Bebas Neue" (bold, impactful — streetwear feel)

- Subheadings: "Montserrat" (700 weight)

- Body: "Inter" (clean, readable)

- All from Google Fonts



Aesthetic: Premium dark streetwear brand.

Think: Supreme meets local Pakistani fashion.

Dark, bold, red accents, gold for premium badges.

Every pixel must scream "expensive brand."



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗄️ SUPABASE TABLES — CREATE ALL:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



1. site_settings

(id uuid pk, key TEXT UNIQUE, value TEXT)

Seed:

- brand_name: "HBH Collection"

- tagline: "Premium Fashion. All Pakistan Delivery."

- specialty: "Premium T-Shirts, Jeans & Shirts"

- whatsapp: "03112578079"

- phone: "03302033640"

- email: "hbhcollection@gmail.com"

- address: "Pakistan"

- delivery_info: "Free delivery on orders above PKR 2,000"

- announcement: "🔥 New Collection Just Dropped — Shop Now!"

- announcement_active: "true"

- currency: "PKR"

- facebook: ""

- instagram: ""

- tiktok: "https://www.tiktok.com/@hbh.collection"

- return_policy: "7-day easy return & exchange"

- shipping_time: "3-5 working days across Pakistan"



2. categories

(id uuid pk, name TEXT, slug TEXT UNIQUE,

gender TEXT, -- 'men'/'women'/'kids'/'all'

icon TEXT, image_url TEXT,

display_order INT, is_active BOOL DEFAULT true)



Seed categories:

Men's:

- Premium T-Shirts | men | display_order: 1

- Casual Shirts | men | display_order: 2

- Jeans & Pants | men | display_order: 3

- Hoodies & Sweatshirts | men | display_order: 4

- Shorts | men | display_order: 5



Women's:

- Women's T-Shirts | women | display_order: 6

- Kurtas & Tops | women | display_order: 7

- Women's Jeans | women | display_order: 8

- Activewear | women | display_order: 9



Kids':

- Boys Collection | kids | display_order: 10

- Girls Collection | kids | display_order: 11



3. products

(id uuid pk, category_id uuid fk,

name TEXT, slug TEXT UNIQUE,

description TEXT, 

price DECIMAL,

original_price DECIMAL nullable,

images JSONB, -- array of image URLs

sizes JSONB, -- ["XS","S","M","L","XL","XXL"]

colors JSONB, -- [{"name":"Black","hex":"#000000"},...]

material TEXT nullable,

care_instructions TEXT nullable,

stock_status TEXT DEFAULT 'in_stock',

-- 'in_stock'/'low_stock'/'out_of_stock'

is_featured BOOL DEFAULT false,

is_new_arrival BOOL DEFAULT false,

is_bestseller BOOL DEFAULT false,

is_on_sale BOOL DEFAULT false,

sku TEXT nullable,

weight_grams INT nullable,

created_at TIMESTAMPTZ DEFAULT now())



4. product_variants

(id uuid pk, product_id uuid fk,

size TEXT, color TEXT,

stock_quantity INT DEFAULT 0,

is_available BOOL DEFAULT true)



5. customers

(id uuid pk,

full_name TEXT, email TEXT UNIQUE,

phone TEXT, 

default_address JSONB,

created_at TIMESTAMPTZ DEFAULT now(),

supabase_auth_id UUID nullable)



6. orders

(id uuid pk,

order_number TEXT UNIQUE,

customer_id uuid fk nullable,

customer_name TEXT,

customer_phone TEXT,

customer_email TEXT nullable,

shipping_address JSONB,

-- {street, city, province, postal_code}

payment_method TEXT,

subtotal DECIMAL,

shipping_charge DECIMAL,

discount_amount DECIMAL DEFAULT 0,

total DECIMAL,

status TEXT DEFAULT 'pending',

-- pending/confirmed/processing/shipped/delivered/cancelled/returned

tracking_number TEXT nullable,

notes TEXT nullable,

created_at TIMESTAMPTZ DEFAULT now())



7. order_items

(id uuid pk, order_id uuid fk,

product_id uuid fk nullable,

product_name TEXT,

product_image TEXT,

size TEXT, color TEXT,

price DECIMAL, quantity INT,

subtotal DECIMAL)



8. cart_items

(id uuid pk,

session_id TEXT,

customer_id uuid fk nullable,

product_id uuid fk,

size TEXT, color TEXT,

quantity INT,

created_at TIMESTAMPTZ DEFAULT now())



9. wishlists

(id uuid pk,

customer_id uuid fk,

product_id uuid fk,

created_at TIMESTAMPTZ DEFAULT now())



10. reviews

(id uuid pk,

product_id uuid fk,

customer_name TEXT,

customer_email TEXT nullable,

rating INT CHECK (rating BETWEEN 1 AND 5),

title TEXT nullable,

comment TEXT,

is_verified BOOL DEFAULT false,

is_approved BOOL DEFAULT false,

created_at TIMESTAMPTZ DEFAULT now())



11. discount_codes

(id uuid pk,

code TEXT UNIQUE,

type TEXT, -- 'percentage'/'fixed'

value DECIMAL,

min_order DECIMAL DEFAULT 0,

max_uses INT nullable,

used_count INT DEFAULT 0,

valid_until TIMESTAMPTZ nullable,

is_active BOOL DEFAULT true)



12. shipping_zones

(id uuid pk,

province TEXT,

charge DECIMAL,

free_above DECIMAL nullable,

est_days TEXT)



Seed shipping zones:

- Punjab: PKR 150 | Free above PKR 2000 | 2-3 days

- Sindh: PKR 180 | Free above PKR 2000 | 3-4 days

- KPK: PKR 200 | Free above PKR 2000 | 4-5 days

- Balochistan: PKR 250 | Free above PKR 3000 | 5-7 days

- Islamabad: PKR 150 | Free above PKR 2000 | 1-2 days

- AJK/GB: PKR 300 | Free above PKR 3000 | 5-7 days



13. announcements

(id uuid pk, text TEXT,

bg_color TEXT DEFAULT '#CC0000',

text_color TEXT DEFAULT '#FFFFFF',

is_active BOOL DEFAULT false,

link TEXT nullable)



14. banners

(id uuid pk, title TEXT,

subtitle TEXT, image_url TEXT,

cta_text TEXT, cta_link TEXT,

display_order INT,

is_active BOOL DEFAULT true)



15. contact_messages

(id uuid pk, sender_name TEXT,

sender_email TEXT, subject TEXT,

message TEXT, is_read BOOL DEFAULT false,

created_at TIMESTAMPTZ DEFAULT now())



16. admin_users

(id uuid pk, email TEXT UNIQUE,

name TEXT, role TEXT DEFAULT 'manager',

is_active BOOL DEFAULT true,

created_at TIMESTAMPTZ DEFAULT now())



RLS:

Public READ: categories, products, reviews(approved),

  site_settings, announcements, banners, shipping_zones

Public INSERT: orders, order_items, cart_items,

  reviews, contact_messages, customers

Auth required: everything else



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 CUSTOMER WEBSITE — ALL PAGES:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



━━━━━━━

NAVBAR (sticky):

━━━━━━━

- Left: HBH Logo (text: "HBH" in gold Bebas Neue 

  + "COLLECTION" small in red)

- Center: Men | Women | Kids | Sale | New Arrivals

  Each with dropdown mega menu showing subcategories

- Right: Search icon | Wishlist icon (count badge)

  | Account icon | Cart icon (count badge)

- Mobile: hamburger → full overlay

  Gender tabs: Men | Women | Kids

  Then categories under each

- Announcement ticker above navbar:

  Scrolling: from announcements table



━━━━━━━

/ HOMEPAGE:

━━━━━━━



1. HERO BANNER SLIDER:

- Full viewport height

- Auto-sliding (3 banners from banners table)

- Each banner: full bg image + overlay

  Title (Bebas Neue, massive)

  Subtitle

  CTA button → category/product page

- Navigation arrows + dot indicators

- First banner seed:

  Title: "NEW COLLECTION"

  Subtitle: "Premium T-Shirts — All Pakistan Delivery"

  Image: https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80&fm=webp

  CTA: "Shop Men's" → /men



2. GENDER QUICK LINKS (below hero):

3 large tiles side by side:

- MEN → /men

  Image: https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80&fm=webp

- WOMEN → /women

  Image: https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&fm=webp

- KIDS → /kids

  Image: https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80&fm=webp

Each: dark overlay + gender name in Bebas Neue

Hover: overlay lightens, "Shop Now" appears



3. NEW ARRIVALS SECTION:

Title: "NEW ARRIVALS" (gold underline)

Horizontal scroll on mobile, 4-col grid desktop

Products where is_new_arrival=true

Each card (see Product Card design below)



4. BESTSELLERS:

Title: "BESTSELLERS"

Same grid, products where is_bestseller=true



5. BRAND PROMISE STRIP:

4 icons in a row (dark bg, gold icons):

🚚 Free Delivery Above PKR 2,000

↩️ 7-Day Easy Returns

✅ 100% Genuine Products

📦 All Pakistan Delivery



6. FEATURED CATEGORY BANNER:

Full width dark banner:

"PREMIUM T-SHIRTS COLLECTION 🔥"

"Starting from PKR 999"

"Shop Now" → /men/t-shirts

Image: https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80&fm=webp



7. ON SALE SECTION:

Products where is_on_sale=true

Red "SALE" badge prominent

Show original + discounted price



8. TRUST SECTION:

"Why Choose HBH Collection?"

- Premium Quality Fabric

- Stitched with precision

- Sizes XS to XXL available  

- Worn by 1000+ customers



9. INSTAGRAM/TIKTOK FEED PLACEHOLDER:

"Follow us @hbh.collection"

Grid of 6 placeholder tiles

TikTok + Instagram + Facebook icons



10. NEWSLETTER SECTION:

Dark red bg

"Get 10% OFF your first order"

Email input + "Subscribe" button

Saves to Supabase



━━━━━━━

PRODUCT CARD DESIGN (used everywhere):

━━━━━━━

- Dark card #111111

- Product image (aspect ratio 3:4, object-cover)

- TOP badges (absolute positioned):

  * "NEW" — gold pill (if is_new_arrival)

  * "SALE" — red pill (if is_on_sale)

  * "BESTSELLER 🔥" — dark red (if is_bestseller)

- Wishlist heart icon (top right, click to save)

- Image hover: second image shows (if exists in images array)

- Below image:

  * Product name (white, Montserrat 600)

  * Color dots (small circles for available colors)

  * Price row: PKR 1,299

    Original strikethrough if on sale

  * Size pills (XS S M L XL XXL) — quick select

  * "Add to Cart" button (appears on hover desktop,

    always visible mobile)



━━━━━━━

/men, /women, /kids (CATEGORY PAGES):

━━━━━━━

- Breadcrumb: Home > Men's

- Left sidebar (desktop) / Filter drawer (mobile):

  * Category filter (checkboxes)

  * Size filter (XS S M L XL XXL)

  * Color filter (color swatches)

  * Price range slider

  * Sort: Newest | Price Low-High | Price High-Low

    | Bestselling

- Product grid (3 col desktop, 2 col mobile)

- Infinite scroll or pagination

- Results count: "Showing 24 of 48 products"



━━━━━━━

/men/[category-slug] etc:

━━━━━━━

Same as above but filtered to that category



━━━━━━━

/products/[slug] PRODUCT DETAIL PAGE:

━━━━━━━



LEFT: Image Gallery

- Main large image

- Thumbnail strip below (4 images)

- Zoom on hover (desktop)

- Swipe on mobile

- Images from product.images JSONB array



RIGHT: Product Info

- Breadcrumb

- Brand: "HBH COLLECTION" (small, gold)

- Product name (Bebas Neue, large)

- Rating stars + review count

- Price (large, white)

  Original strikethrough if on sale

- "Save PKR X" badge (if on sale)



COLOR SELECTOR:

- Label: "Color: Black"

- Color swatches (circles)

- Click to select — updates images



SIZE SELECTOR:

- Label: "Size: M" 

- Size grid buttons

- Out of stock sizes: strikethrough, disabled

- "Size Guide" link → modal with size chart table



QUANTITY SELECTOR:

- — 1 + buttons



ACTION BUTTONS:

- "ADD TO CART" (full width, red, large)

- "BUY ON WHATSAPP" (full width, green, outlined)

  → wa.me/923112578079?text=

  "Hi! I want to order [PRODUCT NAME]

   Size: [selected size]

   Color: [selected color]

   Quantity: [qty]

   Please confirm availability."



DELIVERY INFO:

- Estimated delivery: 3-5 working days

- Free delivery above PKR 2,000

- Province-wise delivery time

- "Track your order" link



PRODUCT DETAILS TABS:

Tab 1: Description

Tab 2: Size & Fit

  Size chart table (XS-XXL chest/waist/length)

Tab 3: Material & Care

Tab 4: Reviews

  Star breakdown (5★ count, 4★ count etc.)

  Review cards

  "Write a Review" button → modal form



RECENTLY VIEWED (below product):

Last 4 products viewed (localStorage)



YOU MIGHT ALSO LIKE:

4 products from same category



━━━━━━━

/cart PAGE:

━━━━━━━

- Cart items table:

  Image | Product name + size + color | Price | Qty | Total | Remove

- ORDER SUMMARY sidebar:

  Subtotal

  Discount code input:

  [Code field] [Apply] → validates against discount_codes

  Shipping (select province → auto-calculate)

  Total

  "PROCEED TO CHECKOUT" button (red, large)

- "Continue Shopping" link

- "Order via WhatsApp Instead" link → WA with full cart



━━━━━━━

/checkout PAGE:

━━━━━━━



STEP 1 — Customer Info:

- Full Name *

- Phone/WhatsApp * (Pakistani format)

- Email (optional)

- If logged in: pre-fill from profile



STEP 2 — Shipping Address:

- Street Address *

- City *

- Province * (dropdown → auto-loads shipping charge)

- Postal Code

- Delivery notes (optional)



STEP 3 — Payment Method:

Radio cards:

○ Cash on Delivery (COD)

○ JazzCash → 0311-2578079

○ Easypaisa → 0330-2033640

○ Bank Transfer → account details



STEP 4 — Order Review:

- Items list

- Subtotal + shipping + discount + total

- "PLACE ORDER" button



ON SUCCESS:

- Generate: "HBH-" + 6 random digits

- Save to orders + order_items

- Redirect to /order-success



━━━━━━━

/order-success:

━━━━━━━

- ✅ Green animated checkmark

- "Order Placed Successfully!"

- Order number: #HBH-284739

- Items ordered + total

- "We will confirm your order within 1 hour"

- For COD: "Our team will call to confirm"

- For JazzCash/Easypaisa: 

  "Please send payment to 0311-2578079

   and share screenshot on WhatsApp"

- Buttons:

  "Track Order" | "Continue Shopping" | 

  "Contact on WhatsApp" → wa.me/923112578079



━━━━━━━

/track:

━━━━━━━

- Input: Order number (HBH-XXXXXX) + phone

- Fetch from orders

- Progress stepper:

  📦 Order Placed →

  ✅ Confirmed →

  🏭 Processing →

  🚚 Shipped (show tracking number) →

  ✅ Delivered

- Order details shown below



━━━━━━━

/login & /signup:

━━━━━━━

- Supabase Auth

- Dark themed forms

- On signup: save to customers table



━━━━━━━

/account:

━━━━━━━

Tabs:

1. My Orders — list + status + reorder button

2. Wishlist — saved products grid

3. Profile — edit name, phone, address

4. Return Request — initiate return on delivered orders



━━━━━━━

/sale:

━━━━━━━

- All products where is_on_sale=true

- Red banner at top: "SALE UP TO 50% OFF"

- Same grid + filters



━━━━━━━

/new-arrivals:

━━━━━━━

- All products where is_new_arrival=true

- "Just Dropped 🔥" heading



━━━━━━━

/contact:

━━━━━━━

- Contact info (from settings)

- WhatsApp direct link (prominent)

- Contact form → saves to contact_messages

- TikTok + Instagram links



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 ADMIN PANEL (/admin):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



LOGIN:

- Dark themed

- Email + Password → Supabase auth

- Check admin_users role



SIDEBAR:

📊 Dashboard

📦 Orders

👔 Products

📂 Categories

🏷️ Discount Codes

🚚 Shipping Zones

🖼️ Banners

📢 Announcements

⭐ Reviews

📩 Messages

👥 Admin Users (super_admin only)

⚙️ Settings

🚪 Logout



━━━━━━━━━

DASHBOARD:

━━━━━━━━━

Stats (4 cards):

- Today's Orders | Revenue Today

- Pending Orders | Total Products



Charts:

- Line: Revenue last 30 days

- Bar: Orders per day last 7 days

- Pie: Orders by status



Quick alerts:

- 🔴 New orders

- 🟡 Low stock products (quantity < 5)

- 📩 Unread messages



━━━━━━━━━

ORDERS:

━━━━━━━━━

Filter: All | Pending | Confirmed | Processing |

        Shipped | Delivered | Cancelled | Returned



Table columns:

Order # | Date | Customer | Items | Total |

Payment | Status | Actions



Order detail modal/page:

- All items with images

- Customer info + address

- Payment status

- Update status dropdown

- Add tracking number field

- "WhatsApp Customer" button



━━━━━━━━━

PRODUCTS:

━━━━━━━━━

Table: Image | Name | Category | Price | Stock | Badges | Actions



Filters: Category | Status | Badges



ADD/EDIT PRODUCT MODAL/PAGE:

Section 1 — Basic:

- Product name *

- Category (dropdown from categories)

- Description (rich textarea)

- SKU (optional)



Section 2 — Pricing:

- Price (PKR) *

- Original Price (for strikethrough)

- Is on sale? toggle



Section 3 — Images:

- Multiple image URL inputs (up to 6)

- Preview thumbnails

- First image = main image



Section 4 — Variants:

SIZES available (checkboxes):

XS | S | M | L | XL | XXL | XXXL



COLORS (dynamic add rows):

[Color Name] [Color Hex picker] [+ Add Color] [- Remove]

e.g. Black #000000 | White #FFFFFF | Red #CC0000



Section 5 — Stock per variant:

Auto-generates grid:

Size × Color = Quantity input

e.g. M × Black = 50 units



Section 6 — Details:

- Material (text)

- Care instructions (textarea)

- Weight in grams



Section 7 — Badges:

☐ New Arrival

☐ Bestseller

☐ Featured (shows on homepage)



Section 8 — SEO:

- Meta title

- Meta description



━━━━━━━━━

CATEGORIES:

━━━━━━━━━

Table: Name | Gender | Products Count | Order | Active



ADD/EDIT:

- Name *

- Gender (Men/Women/Kids/All)

- Slug (auto-generated from name)

- Icon (emoji)

- Image URL

- Display order

- Active toggle



DRAG TO REORDER



━━━━━━━━━

DISCOUNT CODES:

━━━━━━━━━

Table: Code | Type | Value | Min Order | Uses | Expiry | Active



ADD:

- Code (text, auto-uppercase) *

- Type: Percentage % OR Fixed PKR

- Value (e.g. 10 for 10% or 200 for PKR 200)

- Minimum order amount

- Maximum uses (optional)

- Valid until (date, optional)

- Active toggle



━━━━━━━━━

SHIPPING ZONES:

━━━━━━━━━

Table: Province | Charge | Free Above | Est Days



Edit inline — province charges

Add new zone



━━━━━━━━━

BANNERS:

━━━━━━━━━

- Homepage hero slider banners

- Title, subtitle, image URL, CTA text, CTA link

- Reorder

- Active toggle



━━━━━━━━━

REVIEWS:

━━━━━━━━━

Pending tab: Approve / Reject

Approved tab: Show on site / Delete

Verified badge toggle (for actual buyers)



━━━━━━━━━

MESSAGES:

━━━━━━━━━

Contact form inbox

Mark read/unread

Reply via mailto link

Delete



━━━━━━━━━

SETTINGS:

━━━━━━━━━

Tabs:

1. Brand Info — name, tagline, specialty,

   whatsapp, phone, email, address

2. Delivery — shipping message, return policy

3. Payment — JazzCash/Easypaisa numbers,

   bank details, COD toggle

4. Social — Facebook, Instagram, TikTok links

5. Appearance — primary color, gold color picker

6. Security — change admin email/password



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 SEED DATA:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



6 Sample Products:



1. HBH Premium Polo T-Shirt

   Category: Men's T-Shirts

   Price: PKR 1,299 | Original: PKR 1,799

   is_on_sale: true | is_bestseller: true

   Sizes: S M L XL XXL

   Colors: Black, White, Navy Blue, Red

   Image: https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&fm=webp



2. HBH Graphic Tee

   Category: Men's T-Shirts  

   Price: PKR 999

   is_new_arrival: true

   Colors: Black, White, Grey

   Image: https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80&fm=webp



3. HBH Slim Fit Jeans

   Category: Jeans & Pants

   Price: PKR 2,499 | Original: PKR 3,499

   is_on_sale: true

   Sizes: 28 30 32 34 36

   Colors: Dark Blue, Black, Light Blue

   Image: https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80&fm=webp



4. HBH Casual Shirt

   Category: Casual Shirts

   Price: PKR 1,599

   is_featured: true

   Colors: White, Light Blue, Black

   Image: https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80&fm=webp



5. HBH Women's Crop Tee

   Category: Women's T-Shirts

   Price: PKR 899

   is_new_arrival: true

   Colors: White, Black, Pink

   Image: https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80&fm=webp



6. HBH Kids Graphic Tee

   Category: Boys Collection

   Price: PKR 699

   is_bestseller: true

   Sizes: 2-3Y 4-5Y 6-7Y 8-9Y 10-11Y 12-13Y

   Colors: White, Black, Red

   Image: https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80&fm=webp



Admin Credentials:

Email: uzairahmadtunio786@gmail.com

Role: super_admin



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ CRITICAL RULES:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



1. Cart persists in localStorage + Supabase

   (guest cart merges with account on login)

2. Wishlist: localStorage for guests,

   Supabase wishlists table for logged-in

3. Prov

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hbhlarkana.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1b0ed8fb-7b43-4f7a-9242-86c85a986236).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
