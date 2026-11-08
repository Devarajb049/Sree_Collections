# Sree Collections (శ్రీ కలెక్షన్స్) – Premium Traditional Indian Saree E-Commerce & WhatsApp Ordering Website

A complete, responsive, production-ready saree catalogue and WhatsApp ordering website designed with a luxury South Indian showroom aesthetic (Deep Maroon, Royal Gold, Ivory, and White). 

Designed for 100% static hosting on **Cloudflare Pages**, with a scalable **Supabase** backend (PostgreSQL database, Row Level Security, Supabase Auth, and Storage for saree photos).

---

## 🌟 Key Features

### 1. Customer Storefront (`index.html`)
- **Royal Traditional Aesthetics**: Inspired by high-end South Indian silk showrooms with gold zari accents, subtle Indian motifs, and luxury typography (`Cinzel`, `Playfair Display`, `Plus Jakarta Sans`, and `Noto Sans Telugu`).
- **Bilingual Experience**: Dual English & Telugu welcomes, saree titles, and category titles.
- **Rich Saree Catalogue**:
  - Live search by saree title, fabric, color, or product code (SKU).
  - Category filters: Kanchipuram Silk, Banarasi Silk, Pattu Sarees, Handloom Cotton, Fancy & Organza, Bridal/Wedding Sarees, Daily Wear.
  - Sorting: Featured, Price (Low to High), Price (High to Low), New Arrivals, and Biggest Discounts.
  - Availability filter (All vs In Stock only) and Fabric filters.
- **Detailed Saree Specifications Modal**:
  - High-res photography preview.
  - Saree specifications: Fabric, Zari type, Blouse piece details, Length, and Care instructions.
  - Single-click direct WhatsApp enquiry button.
- **Interactive Shopping Cart**:
  - Stored and persisted in `localStorage`.
  - Increment, decrement, and item removal.
  - Subtotal and free shipping qualification progress bar (Free delivery over ₹3,000).
- **Formatted WhatsApp Checkout**:
  - Collects customer name, phone, delivery city/pincode, and special requests.
  - Generates a rich, structured WhatsApp order message itemizing product names, SKUs, individual prices, product page web links, and image links.
  - Direct click-to-chat opens with the showroom's configured WhatsApp number.
- **Demo Catalogue Safety**:
  - Sample products are clearly marked with a `Demo Saree` badge, ensuring transparency when running before live database connection.

### 2. Admin Dashboard (`admin.html`)
- **Supabase Authentication**: Secure login for showroom managers using email and password.
- **Real-Time Inventory Overview**: Stat counters for total sarees, active listings, low-stock/sold-out alerts, and categories.
- **Full Saree CRUD Operations**:
  - Add new sarees with comprehensive attributes (titles in EN & TE, SKU, prices, fabrics, zari type, blouse details, etc.).
  - Upload saree photos directly to the Supabase Storage bucket (`saree-images`) or specify external image URLs.
  - Edit existing saree descriptions, pricing, and stock status.
  - Delete sarees with a confirmation dialog.
- **Quick Controls in Table**:
  - Toggle stock status (`In Stock`, `Low Stock`, `Sold Out`) directly in table.
  - Show / Hide sarees from customer storefront with one click.
- **Demo / LocalStorage Mode**:
  - If Supabase is not yet configured, administrators can still test the entire dashboard workflow via LocalStorage.
- **One-Click Data Seeding**:
  - Includes a "Seed 12 Demo Sarees" button to instantly populate a fresh Supabase database with curated handloom sarees.

---

## 📁 Project Structure

```
Sree_Collections/
├── index.html                    # Main customer storefront
├── admin.html                    # Secure admin dashboard
├── css/
│   ├── styles.css                # Storefront styling (mobile-first, royal maroon/gold)
│   └── admin.css                 # Admin dashboard styling
├── js/
│   ├── config.js                 # Central configuration (WhatsApp #, Supabase URL/key)
│   ├── products-data.js          # Default curated demo inventory & categories
│   ├── app.js                    # Storefront controller & WhatsApp checkout
│   └── admin.js                  # Admin authentication & inventory CRUD controller
├── assets/
│   └── icons/
│       ├── logo.svg              # Sree Collections brand logo (traditional motif)
│       └── favicon.svg           # Website browser favicon
├── database/
│   └── supabase-setup.sql        # Supabase SQL schema, RLS policies, Storage setup & seed data
└── README.md                     # Documentation & setup guide
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Configure Store Information (`js/config.js`)

Open `js/config.js` and update your shop details:

```javascript
const CONFIG = {
  shop: {
    name: "Sree Collections",
    nameTe: "శ్రీ కలెక్షన్స్",
    phone: "+91 98765 43210",
    // Set your 10-digit WhatsApp number with country code (no '+' or spaces)
    whatsappNumber: "919876543210",
    email: "orders@sreecollections.com",
    address: "Door No. 40-1-52, MG Road, Near Benz Circle, Vijayawada, Andhra Pradesh - 520010, India",
    freeShippingThreshold: 3000
  },
  supabase: {
    url: "YOUR_SUPABASE_PROJECT_URL",       // e.g., https://abcdefghijkl.supabase.co
    anonKey: "YOUR_SUPABASE_ANON_KEY",      // Your public anon key
    storageBucket: "saree-images"
  }
};
```

---

### Step 2: Set Up Supabase Backend

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a free project.
   - Choose a region close to your target audience (e.g., `South Asia - Mumbai / ap-south-1`).

2. **Execute Database Setup Script**:
   - In your Supabase dashboard, click **SQL Editor** on the left menu.
   - Click **New query**, open `database/supabase-setup.sql` from this repository, copy its entire contents, and paste into the editor.
   - Click **Run**.
   - This automatically creates:
     - The `products` table with all fields and indexes.
     - Row Level Security (RLS) policies allowing public read of active items and admin full CRUD.
     - The `saree-images` public storage bucket and upload policies.
     - Initial seed data of 12 traditional sarees.

3. **Get API Credentials**:
   - In Supabase, go to **Project Settings** &rarr; **API**.
   - Copy the **Project URL** and paste it as `supabase.url` in `js/config.js`.
   - Copy the **Project API Key (`anon` / `public`)** and paste it as `supabase.anonKey` in `js/config.js`.
   - ⚠️ *Security note: Never use the `service_role` key in frontend code.*

4. **Create the First Admin User**:
   - In Supabase, go to **Authentication** &rarr; **Users**.
   - Click **Add User** &rarr; **Create user**.
   - Enter your admin email (e.g., `admin@sreecollections.com`) and choose a strong password.
   - Toggle **Auto Confirm User?** to `ON` (or confirm via email).
   - You can now log in at `yourdomain.com/admin.html` with these credentials!

---

### Step 3: Test Locally

You can run the built-in automated test suite:
```powershell
node test-suite.js
```
This runs 115 unit assertions covering product integrity, category validation, cart math, free shipping thresholds, WhatsApp URL generation, and SQL policy verification.

To run the site in your browser:
```powershell
# Using Python
python -m http.server 8080

# Or using Node.js
npx serve .
```

Open `http://localhost:8080` in your browser.

---

### Step 4: Deploy to Cloudflare Pages

Cloudflare Pages provides global edge hosting with free SSL, zero maintenance, and fast loading across India.

#### Option A: Direct Upload (Drag and Drop - Fastest)
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Upload assets**.
3. Name your project (e.g., `sree-collections`).
4. Drag and drop the `Sree_Collections` folder.
5. Click **Deploy site**.
6. Your website is immediately live at `https://sree-collections.pages.dev`!

#### Option B: Deploy via GitHub / GitLab
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Sree Collections Release"
   git remote add origin https://github.com/your-username/sree-collections.git
   git push -u origin main
   ```
2. In Cloudflare Dashboard &rarr; **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
3. Select your repository.
4. Set build settings:
   - **Framework preset**: None
   - **Build command**: *(leave empty)*
   - **Build output directory**: `.` (or root directory)
5. Click **Save and Deploy**. Every push to `main` will automatically build and deploy.

---

## 📱 WhatsApp Order Message Format

When a customer clicks **"Order via WhatsApp / ఆర్డర్ చేయండి"**, the application formats a message sent to the store:

```
*NAMASTE SREE COLLECTIONS!*
I would like to place an order from your website catalogue:

*CUSTOMER DETAILS:*
• Name: Smt. Ananya Rao
• Phone: +91 98765 00000
• Delivery City/Pincode: Hyderabad - 500081
• Special Notes: Please share video before dispatch

*ORDERED SAREES (2 items):*
----------------------------------------
1. *Royal Crimson Kanchipuram Pure Silk Saree*
   • Code: SRC-101
   • Fabric: Pure Kanchipuram Mulberry Silk
   • Qty: 1 × ₹18,499 = ₹18,499
   • Web Link: https://sree-collections.pages.dev/?product=SRC-101
   • Image: https://images.unsplash.com/...
----------------------------------------
2. *Traditional Mangalagiri Pure Cotton Saree with Nizam Border*
   • Code: SRC-105
   • Fabric: 100% Pure Combed Handloom Cotton (80s count)
   • Qty: 2 × ₹2,899 = ₹5,798
   • Web Link: https://sree-collections.pages.dev/?product=SRC-105
   • Image: https://images.unsplash.com/...
----------------------------------------
*Subtotal:* ₹24,297
*Shipping:* FREE (Orders over ₹3,000)
*ESTIMATED TOTAL: ₹24,297*
----------------------------------------

Please confirm availability and share payment options (UPI/GPay/PhonePe/Bank Transfer). Thank you!
```

---

## 🛡️ Security & Architecture Best Practices

- **Zero Secret Exposure**: Only the public `anon` key is used in `js/config.js`. Row Level Security (RLS) protects write/edit/delete operations on PostgreSQL.
- **Public Read Access**: Anonymous customers can only read sarees where `is_active = true`.
- **Admin Write Verification**: Insert, update, and delete policies enforce `TO authenticated`.
- **Public Storage Read**: Customers can load uploaded images without authentication tokens.

---

## 💬 Support & Business Inquiries
- **Showroom Address**: Door No. 40-1-52, MG Road, Near Benz Circle, Vijayawada, Andhra Pradesh - 520010
- **Phone & WhatsApp**: +91 98765 43210
- **Email**: orders@sreecollections.com
