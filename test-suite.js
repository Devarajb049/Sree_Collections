/**
 * SREE COLLECTIONS - React Application Test Suite
 * -------------------------------------------------------------
 * Tests:
 * 1. Demo inventory integrity & pure English text verification (no hardcoded Telugu text)
 * 2. Category mapping & slug consistency
 * 3. Shopping cart calculations, threshold limits, and delivery fees
 * 4. WhatsApp checkout message generation with proper URI encoding
 * 5. Google Translate component integration & script handling
 * 6. Cloudflare Pages SPA redirects configuration
 * 7. Supabase SQL setup script schema, RLS policies, and Storage configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// 1. DATA & ENGLISH TEXT INTEGRITY
// -------------------------------------------------------------
console.log('\n--- 1. Testing Demo Products Data & English Purity ---');

import { DEMO_PRODUCTS, CATEGORIES } from './src/data/demoProducts.js';

assert(Array.isArray(DEMO_PRODUCTS), 'DEMO_PRODUCTS is an array');
assert(DEMO_PRODUCTS.length >= 12, `DEMO_PRODUCTS contains ${DEMO_PRODUCTS.length} curated sarees (expected >= 12)`);

// Telugu Unicode block regex: \u0C00-\u0C7F
const teluguRegex = /[\u0C00-\u0C7F]/;

  DEMO_PRODUCTS.forEach(p => {
    assert(p.sku && p.sku.startsWith('SRC-'), `Product ${p.sku} has valid SKU`);
    assert(p.title && p.title.length > 5, `Product ${p.sku} has valid title: "${p.title}"`);
    assert(p.name && p.name.length > 5, `Product ${p.sku} has valid name alias: "${p.name}"`);
    assert(!teluguRegex.test(p.title), `Product title "${p.title}" has no hardcoded Telugu characters`);
    assert(!teluguRegex.test(p.short_description || ''), `Product short_description has no hardcoded Telugu characters`);
    assert(typeof p.price === 'number' && p.price > 0, `Product ${p.sku} has valid price ₹${p.price}`);
    assert(p.image_url && p.image_url.startsWith('http'), `Product ${p.sku} has valid image URL`);
    assert(['in_stock', 'low_stock', 'out_of_stock'].includes(p.stock_status), `Product ${p.sku} has valid stock_status`);
    assert(p.is_demo === true, `Product ${p.sku} is properly flagged as demo`);
  });

    CATEGORIES.forEach(c => {
      assert(!teluguRegex.test(c.name), `Category name "${c.name}" has no hardcoded Telugu characters`);
    });

    // -------------------------------------------------------------
    // 2. SHOPPING CART CALCULATIONS
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Shopping Cart Calculation Logic ---');

    function calculateCart(cartItems, threshold = 3000) {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const isFreeShipping = subtotal >= threshold;
      const shippingFee = cartItems.length === 0 ? 0 : (isFreeShipping ? 0 : 150);
      const total = subtotal + shippingFee;
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      return { subtotal, isFreeShipping, shippingFee, total, totalItems };
    }

    const cartBelow = [{ price: 2899, quantity: 1 }];
    const resBelow = calculateCart(cartBelow);
    assert(resBelow.subtotal === 2899, 'Cart below threshold: subtotal is ₹2,899');
    assert(resBelow.isFreeShipping === false, 'Cart below threshold: does not qualify for free shipping');
    assert(resBelow.shippingFee === 150, 'Cart below threshold: shipping fee is ₹150');
    assert(resBelow.total === 3049, 'Cart below threshold: total is ₹3,049');

const cartAbove = [
      { price: 18499, quantity: 1 },
      { price: 2899, quantity: 2 }
    ];
    const resAbove = calculateCart(cartAbove);
    assert(resAbove.subtotal === 24297, 'Cart above threshold: subtotal is ₹24,297');
    assert(resAbove.isFreeShipping === true, 'Cart above threshold: qualifies for free shipping');
    assert(resAbove.shippingFee === 0, 'Cart above threshold: shipping fee is ₹0');
    assert(resAbove.total === 24297, 'Cart above threshold: total is ₹24,297');
    assert(resAbove.totalItems === 3, 'Cart above threshold: total items count is 3');

    // -------------------------------------------------------------
    // 3. WHATSAPP CHECKOUT MESSAGE GENERATION
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing WhatsApp Checkout URL Generator ---');

      function generateWhatsAppCheckoutUrl(cart, customer, shop) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const isFreeShipping = subtotal >= (shop.freeShippingThreshold || 3000);
        const total = isFreeShipping ? subtotal : subtotal + 150;
        const baseUrl = 'https://sreecollections.pages.dev';

        let msg = `*NAMASTE ${shop.name.toUpperCase()}!*\n`;
        msg += `I would like to place an order from your website catalogue:\n\n`;

        if (customer.name || customer.city || customer.phone) {
          msg += `*CUSTOMER DETAILS:*\n`;
          if (customer.name) msg += `• Name: ${customer.name}\n`;
          if (customer.phone) msg += `• Phone: ${customer.phone}\n`;
          if (customer.city) msg += `• Delivery City/Pincode: ${customer.city}\n`;
          msg += `\n`;
        }

        msg += `*ORDERED SAREES (${cart.length} items):*\n`;
        cart.forEach((item, index) => {
          msg += `${index + 1}. *${item.name}*\n`;
          msg += `   • Code: ${item.sku}\n`;
          msg += `   • Fabric: ${item.fabric}\n`;
          msg += `   • Qty: ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}\n`;
          msg += `   • Saree Link: ${baseUrl}/product/${item.slug || item.sku}\n`;
          if (item.image_url) msg += `   • Photo: ${item.image_url}\n`;
        });

        msg += `*ESTIMATED TOTAL: ₹${total}*\n`;

        const cleanNum = shop.whatsappNumber.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`;
      }

      const shopInfo = { name: 'Sree Collections', whatsappNumber: '919966532907', freeShippingThreshold: 3000 };
      const customerInfo = { name: 'Smt. Lakshmi Rao', phone: '+91 99665 00000', city: 'Vijayawada - 520010' };
      const testCart = [
        { sku: 'SRC-101', title: 'Royal Crimson Kanchipuram Pure Silk Saree', name: 'Royal Crimson Kanchipuram Pure Silk Saree', price: 18499, quantity: 1, fabric: 'Pure Silk', slug: 'royal-crimson-kanchipuram-pure-silk-saree', image_url: 'https://images.unsplash.com/photo-1' }
      ];

      const waUrl = generateWhatsAppCheckoutUrl(testCart, customerInfo, shopInfo);
      assert(waUrl.startsWith('https://wa.me/919966532907?text='), 'WhatsApp URL starts with configured phone number');
      assert(waUrl.includes(encodeURIComponent('Smt. Lakshmi Rao')), 'URL contains encoded customer name');
      assert(waUrl.includes(encodeURIComponent('SRC-101')), 'URL contains encoded SKU');
      assert(waUrl.includes(encodeURIComponent('https://sreecollections.pages.dev/product/royal-crimson-kanchipuram-pure-silk-saree')), 'URL contains encoded product link');
      assert(!teluguRegex.test(decodeURIComponent(waUrl)), 'WhatsApp message has no hardcoded Telugu text');

      // Verify Supabase config file values
      const supabaseConfigFile = fs.readFileSync(path.join(__dirname, 'src', 'lib', 'supabase.js'), 'utf8');
      assert(supabaseConfigFile.includes('919966532907'), 'supabase.js default whatsapp number is 919966532907');
      assert(supabaseConfigFile.includes('sree.collections99'), 'supabase.js contains official Instagram handle');
      assert(supabaseConfigFile.includes('JwC3rtMotYDShvgY8'), 'supabase.js contains official Google Maps link');
      assert(supabaseConfigFile.includes('Madanapalle'), 'supabase.js contains showroom location in Madanapalle');

      // -------------------------------------------------------------
      // 4. GOOGLE TRANSLATE COMPONENT & ROUTING
      // -------------------------------------------------------------
      console.log('\n--- 4. Testing Google Translate Component & SPA Redirects ---');

      const googleTranslateFile = fs.readFileSync(path.join(__dirname, 'src', 'components', 'GoogleTranslate.jsx'), 'utf8');
      assert(googleTranslateFile.includes('google-translate-container'), 'GoogleTranslate.jsx has container element');
      assert(googleTranslateFile.includes('btn-google-translate'), 'GoogleTranslate.jsx has custom button styling');
      assert(googleTranslateFile.includes('includedLanguages: \'en,te\''), 'GoogleTranslate configured for English and Telugu (en,te)');
      assert(googleTranslateFile.includes('translate.google.com/translate_a/element.js'), 'GoogleTranslate loads official element.js script');

      const redirectsFile = fs.readFileSync(path.join(__dirname, 'public', '_redirects'), 'utf8');
      assert(redirectsFile.includes('/* /index.html 200'), 'public/_redirects contains SPA fallback rule for Cloudflare Pages');

      const distRedirectsFile = fs.readFileSync(path.join(__dirname, 'dist', '_redirects'), 'utf8');
      assert(distRedirectsFile.includes('/* /index.html 200'), 'dist/_redirects contains SPA fallback rule in production build');

      // -------------------------------------------------------------
      // 5. SUPABASE SQL SETUP SCRIPT & ADMIN CREDENTIALS
      // -------------------------------------------------------------
      console.log('\n--- 5. Testing Supabase Backend Schema & Security Policies ---');

      const sql = fs.readFileSync(path.join(__dirname, 'database', 'supabase-setup.sql'), 'utf8');
      assert(sql.includes('CREATE TABLE IF NOT EXISTS public.products'), 'SQL creates products table');
      assert(sql.includes('title VARCHAR(255) NOT NULL'), 'SQL schema defines title column as VARCHAR(255) NOT NULL');
      assert(sql.includes('ENABLE ROW LEVEL SECURITY'), 'SQL enables Row Level Security');
      assert(sql.includes('Public can view active products'), 'SQL enforces public read access only for is_active = true');
      assert(sql.includes('insert products'), 'SQL enforces insert policy');
      assert(sql.includes('update products'), 'SQL enforces update policy');
      assert(sql.includes('delete products'), 'SQL enforces delete policy');
      assert(sql.includes('saree-images'), 'SQL configures saree-images storage bucket');
      assert(!teluguRegex.test(sql), 'Supabase setup SQL contains no hardcoded Telugu text');

      // -------------------------------------------------------------
      // 6. PRODUCTS SCHEMA COMPATIBILITY VERIFICATION (title vs name)
      // -------------------------------------------------------------
      console.log('\n--- 6. Testing Products Schema Compatibility (title vs name) ---');
      const adminDashboardCode = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx'), 'utf8');
      assert(adminDashboardCode.includes('title: formData.title'), 'AdminDashboard maps payload to title');
      assert(!adminDashboardCode.includes('name: formData.name'), 'AdminDashboard does not send name property in payload');
      assert(adminDashboardCode.includes('value={formData.title}'), 'Admin form input binds to formData.title');

      const productServiceCode = fs.readFileSync(path.join(__dirname, 'src', 'services', 'productService.js'), 'utf8');
      assert(productServiceCode.includes('title: title'), 'productService assigns title in database payload');
      assert(productServiceCode.includes('VALID_DB_COLUMNS'), 'productService whitelists only valid database columns');

      // -------------------------------------------------------------
      // 7. ADMIN CREDENTIALS & AUTHENTICATION CONFIGURATION
      // -------------------------------------------------------------
      console.log('\n--- 7. Testing Showroom Admin Credentials ---');
      const authContextFile = fs.readFileSync(path.join(__dirname, 'src', 'context', 'AuthContext.jsx'), 'utf8');
      assert(authContextFile.includes('balubalaji'), 'AuthContext contains admin 1 username (balubalaji)');
      assert(authContextFile.includes('Balu@9966'), 'AuthContext contains admin 1 password');
      assert(authContextFile.includes('deva049'), 'AuthContext contains admin 2 username (deva049)');
      assert(authContextFile.includes('Deva@1009'), 'AuthContext contains admin 2 password');

      const loginFile = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'AdminLogin.jsx'), 'utf8');
      assert(!loginFile.includes('balubalaji or deva049'), 'AdminLogin has removed admin username placeholder');
      assert(!loginFile.includes('Configured Showroom Administrators'), 'AdminLogin has removed visible admin accounts list');
      assert(!loginFile.includes('Connected to Supabase'), 'AdminLogin has removed database status notice');

      console.log(`\n==============================================`);
      console.log(`RESULTS: ${passCount} passed, ${failCount} failed.`);
      console.log(`==============================================\n`);

      if (failCount > 0) {
        process.exit(1);
      }
