# Sree Collections – Premium React Saree E-Commerce Website

A production-ready, fully responsive React.js e-commerce application and WhatsApp ordering platform designed for **Sree Collections**, an authentic Indian traditional saree showroom. 

Features an English-first interface, luxury South Indian showroom aesthetics (Deep Maroon, Royal Gold, Ivory, and White), an official **Google Website Translator** integration to translate dynamically to Telugu, global cart management via React Context API, protected Admin Dashboard with Supabase Auth, and automated deployment configuration for **Cloudflare Pages**.

---

## 🌟 Key Application Features

### 1. English-First Experience with Google Translate Integration
- **Pure English Content**: All headings, navigation labels, category names, descriptions, buttons, and checkout labels are authored in clean, professional English with zero hardcoded Telugu text.
- **Google Website Translator Button (`src/components/GoogleTranslate.jsx`)**:
  - Embedded in the top navigation bar with luxury maroon and gold styling.
  - Automatically loads Google Translate script (`element.js`) and initializes the widget with source language `en` and target language `te` (Telugu).
  - Toggles between English (original) and Telugu dynamically without page reloads.
  - Seamlessly maintains translation across React Router page transitions.
  - Hides default clunky Google iframe banners using clean CSS rules (`.goog-te-banner-frame { display: none !important; }`).

### 2. Customer Website Pages & Routing
- `/` — **Home**: Hero banner with pure silk certification highlights, category browser, featured sarees, bridal pattu showcase, pillars of trust, and customer reviews.
- `/collections` — **All Collections**: Full catalogue with live debounced search, category filter pills, sorting (price asc/desc, newest, discounts), and fabric filters.
- `/category/:slug` — **Category Collections**: Dedicated pages for Kanchipuram Silk, Banarasi, Pattu, Cotton, Fancy, Wedding, and Daily Wear.
- `/product/:id` — **Product Details**: High-resolution image gallery, price breakdown, discount badge, detailed specifications table (Fabric, Zari type, Blouse piece, Saree length, Care instructions), quantity selector, instant WhatsApp order button, and similar saree recommendations.
- `/cart` — **Shopping Cart**: Item quantity controls, subtotal, delivery fee calculation, free shipping progress bar (orders above ₹3,000), customer delivery form, and formatted WhatsApp checkout.
- `/about` — **About Us**: Sree Collections heritage, artisan weaver empowerment, and Silk Mark guarantee.
- `/contact` — **Contact Showroom**: Address, phone numbers, working hours, and WhatsApp inquiry form.

### 3. Shopping Cart & WhatsApp Checkout
- **State Management**: Built with React Context API (`CartContext.jsx`) and persisted in `localStorage`.
- **Stock Limit Enforced**: Prevents visitors from adding quantities exceeding available inventory.
- **WhatsApp Checkout Generator**:
  - Itemizes saree titles, SKU codes, fabrics, colors, quantities, individual rates, and item totals.
  - Generates clickable web links and image URLs for each saree.
  - Automatically formats the WhatsApp click-to-chat URL:
    `https://wa.me/<whatsappNumber>?text=<encoded_message>`

### 4. Admin Dashboard (`/admin`)
- **Protected Routing**: Protected by `ProtectedRoute.jsx` and Supabase Auth session tracking.
- **Showroom Overview**: Stat counters for total inventory, active listings, low-stock/out-of-stock items, and distinct categories.
- **Full Saree CRUD**:
  - Add new sarees with comprehensive fields and direct image upload to the Supabase Storage bucket (`saree-images`) or external image URL.
  - Edit existing sarees, adjust pricing, and modify descriptions.
  - Delete sarees with a safe confirmation dialog.
  - Quick inline controls: toggle active visibility (`Visible` / `Hidden`) and stock status (`In Stock`, `Low Stock`, `Sold Out`) directly in the table.
- **Demo / LocalStorage Mode**: If Supabase credentials are not yet entered in `.env`, showroom managers can test all dashboard features via local demo mode without being blocked.
- **One-Click Seeding**: Includes a "Seed 12 Sarees" button to populate a fresh Supabase database with curated sarees.

### 5. Backend & Database Security
- **PostgreSQL Database (`database/supabase-setup.sql`)**: Complete table schema, indexes, constraints, and automatic `updated_at` trigger.
- **Row Level Security (RLS)**:
  - Public anonymous read access restricted strictly to `is_active = true`.
  - Admin-only access for `INSERT`, `UPDATE`, and `DELETE` (restricted to authenticated users).
- **Public Storage Bucket (`saree-images`)**:
  - Public read policy for customer storefront.
  - Authenticated admin upload, update, and delete policies.
- **Zero Secret Exposure**: Only the public anonymous key (`VITE_SUPABASE_ANON_KEY`) is ever bundled. The Supabase `service_role` key is strictly prohibited on the client.

---

## 📁 Project Architecture

```
sree-collections/
├── public/
│   ├── assets/icons/
│   │   ├── logo.svg              # Sree Collections brand logo
│   │   └── favicon.svg           # Favicon
│   ├── images/
│   ├── _redirects                # Cloudflare Pages SPA fallback (/* /index.html 200)
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx            # Sticky luxury navbar with Google Translate
│   │   ├── Footer.jsx            # Showroom footer with quick links & contact
│   │   ├── Hero.jsx              # Regal hero banner with call-to-actions
│   │   ├── ProductCard.jsx       # Reusable saree card with zoom & quick actions
│   │   ├── ProductGrid.jsx       # Responsive grid with skeleton loaders & empty state
│   │   ├── SearchBar.jsx         # Live search bar with clear button
│   │   ├── CategoryFilter.jsx    # Category filter pills
│   │   ├── CartItem.jsx          # Shopping cart item row with quantity controls
│   │   ├── WhatsAppButton.jsx    # Corner floating WhatsApp widget
│   │   ├── GoogleTranslate.jsx   # Official Google Website Translator component
│   │   ├── LoadingSpinner.jsx    # Luxury gold spinner
│   │   └── ProtectedRoute.jsx    # Route guard for /admin
│   ├── pages/
│   │   ├── Home.jsx              # Homepage
│   │   ├── Collections.jsx       # All collections catalogue
│   │   ├── CategoryPage.jsx      # Dynamic category listings (/category/:slug)
│   │   ├── ProductDetails.jsx    # Saree details view (/product/:id)
│   │   ├── Cart.jsx              # Shopping cart & checkout (/cart)
│   │   ├── About.jsx             # About us story (/about)
│   │   ├── Contact.jsx           # Showroom contact (/contact)
│   │   ├── AdminLogin.jsx        # Admin sign-in (/admin/login)
│   │   ├── AdminDashboard.jsx    # Inventory management portal (/admin)
│   │   └── NotFound.jsx          # 404 page
│   ├── context/
│   │   ├── CartContext.jsx       # Global cart state & WhatsApp checkout engine
│   │   ├── AuthContext.jsx       # Supabase auth session provider
│   │   └── LanguageContext.jsx   # Language state wrapper
│   ├── data/
│   │   └── demoProducts.js       # Curated 12 demo sarees (pure English)
│   ├── lib/
│   │   └── supabase.js           # Supabase client & centralized shop config
│   ├── services/
│   │   └── productService.js     # Unified database & storage service layer
│   ├── styles/
│   │   ├── global.css            # Base typography, tokens, and luxury themes
│   │   └── responsive.css        # Responsive layouts & Google Translate styles
│   ├── App.jsx                   # Application router
│   └── main.jsx                  # React 18 root
├── database/
│   └── supabase-setup.sql        # Supabase PostgreSQL schema, RLS, & storage setup
├── test-suite.js                 # Automated unit test suite (134 assertions passing)
├── .env.example                  # Environment variables template
├── .env                          # Local environment variables
├── .gitignore
├── PROJECT_SKILLS.md             # Antigravity Agent Skills report
├── vite.config.js                # Vite build configuration with chunk optimization
├── package.json
├── index.html                    # Root HTML template
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (`.env`)
Copy `.env.example` to `.env` and enter your store credentials:

```env
# Supabase Configuration (From Supabase Dashboard -> Project Settings -> API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Shop Business Information
VITE_SHOP_NAME="Sree Collections"
VITE_SHOP_WHATSAPP=919876543210
VITE_SHOP_PHONE="+91 98765 43210"
VITE_SHOP_EMAIL="orders@sreecollections.com"
VITE_SHOP_ADDRESS="Door No. 40-1-52, MG Road, Near Benz Circle, Vijayawada, Andhra Pradesh - 520010"
```

### 3. Run Locally in Development Mode
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Run Automated Test Suite
```bash
node test-suite.js
```
Runs 134 automated unit assertions verifying data purity, cart math, WhatsApp URL encoding, Google Translate component configuration, and SQL RLS policies.

### 5. Build for Production
```bash
npm run build
```
Creates an optimized static production bundle in `dist/` ready for Cloudflare Pages.

---

## 🗄️ Setting Up Supabase Backend

1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com) and create a project in region `ap-south-1` (Mumbai).
2. **Execute Database Setup Script**:
   - Open **SQL Editor** in the Supabase Dashboard.
   - Paste the contents of `database/supabase-setup.sql` and click **Run**.
   - This creates the `products` table, Row Level Security policies, the `saree-images` storage bucket, and seeds 12 traditional sarees.
3. **Copy API Credentials**:
   - In **Project Settings** &rarr; **API**, copy the **Project URL** and **`anon` public key** into your `.env` file.
4. **Create Admin User**:
   - In **Authentication** &rarr; **Users**, click **Add User** &rarr; **Create user**.
   - Enter your admin email and password. Toggle **Auto Confirm User?** to `ON`.
   - You can now log in at `/admin/login`!

---

## ☁️ Deploying to Cloudflare Pages

### Option A: Direct Upload (Drag and Drop - Fastest)
1. Run `npm run build` locally.
2. In [dash.cloudflare.com](https://dash.cloudflare.com) &rarr; **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Upload assets**.
3. Name your project (e.g., `sree-collections`).
4. Drag and drop the `dist/` folder.
5. Click **Deploy site**.
6. Cloudflare automatically uses `dist/_redirects` to enable smooth React Router client-side routing.

### Option B: Deploy via GitHub / GitLab
1. Connect your repository to Cloudflare Pages.
2. Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. In **Settings** &rarr; **Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SHOP_WHATSAPP`
4. Click **Save and Deploy**. Every git push will automatically build and deploy!

---

## 🛡️ License & Trademarks
All rights reserved &copy; 2026 **Sree Collections**.
Handcrafted for traditional Indian handlooms and pure silk elegance.
