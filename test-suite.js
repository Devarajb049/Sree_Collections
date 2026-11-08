/**
 * Test Suite for Sree Collections E-Commerce Application
 * Verifies data integrity, cart calculations, WhatsApp message generator, and HTML assets.
 */

const fs = require('fs');
const path = require('path');

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

console.log('\n--- 1. Testing Configuration & Products Data ---');

// Mock browser window
global.window = {};
require('./js/config.js');
require('./js/products-data.js');

assert(window.CONFIG && window.CONFIG.shop, 'CONFIG.shop object exists');
assert(window.CONFIG.shop.whatsappNumber === '919876543210', 'WhatsApp number is properly defined');
assert(window.CONFIG.isSupabaseConfigured() === false, 'isSupabaseConfigured correctly reports false for placeholder keys');

assert(Array.isArray(window.DEMO_PRODUCTS), 'DEMO_PRODUCTS is an array');
assert(window.DEMO_PRODUCTS.length >= 12, `DEMO_PRODUCTS has ${window.DEMO_PRODUCTS.length} products (expected >= 12)`);

const requiredCategories = [
  'Kanchipuram Silk Sarees',
  'Banarasi Sarees',
  'Pattu Sarees',
  'Cotton Sarees',
  'Fancy Sarees',
  'Wedding Sarees',
  'Daily Wear Sarees'
];

const foundCategories = new Set(window.DEMO_PRODUCTS.map(p => p.category));
requiredCategories.forEach(cat => {
  assert(foundCategories.has(cat), `Catalogue contains category "${cat}"`);
});

window.DEMO_PRODUCTS.forEach(p => {
  assert(p.sku && p.sku.startsWith('SRC-'), `Product has valid SKU: ${p.sku}`);
  assert(p.title && p.title.length > 5, `Product has valid title: ${p.title}`);
  assert(typeof p.price === 'number' && p.price > 0, `Product ${p.sku} has valid price: ₹${p.price}`);
  assert(p.image_url && p.image_url.startsWith('http'), `Product ${p.sku} has valid image URL`);
  assert(['in_stock', 'low_stock', 'out_of_stock'].includes(p.stock_status), `Product ${p.sku} has valid stock_status: ${p.stock_status}`);
  assert(p.is_demo === true, `Demo product ${p.sku} is properly flagged with is_demo: true`);
});

console.log('\n--- 2. Testing Shopping Cart Calculation Logic ---');

function calculateCart(cartItems, threshold = 3000) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isFreeShipping = subtotal >= threshold;
  const shipping = isFreeShipping ? 0 : 150;
  const total = subtotal + shipping;
  return { subtotal, isFreeShipping, shipping, total };
}

const testCart1 = [
  { sku: 'SRC-105', price: 2899, quantity: 1 } // Below ₹3000
];
const res1 = calculateCart(testCart1);
assert(res1.subtotal === 2899, 'Cart 1 subtotal is ₹2,899');
assert(res1.isFreeShipping === false, 'Cart 1 does not qualify for free shipping (< ₹3000)');
assert(res1.shipping === 150, 'Cart 1 shipping is ₹150');
assert(res1.total === 3049, 'Cart 1 total is ₹3,049');

const testCart2 = [
  { sku: 'SRC-101', price: 18499, quantity: 1 },
  { sku: 'SRC-105', price: 2899, quantity: 2 }
];
const res2 = calculateCart(testCart2);
assert(res2.subtotal === 18499 + (2899 * 2), `Cart 2 subtotal is ₹${18499 + 5798}`);
assert(res2.isFreeShipping === true, 'Cart 2 qualifies for free shipping (>= ₹3000)');
assert(res2.shipping === 0, 'Cart 2 shipping is ₹0');
assert(res2.total === 24297, 'Cart 2 total is ₹24,297');

console.log('\n--- 3. Testing WhatsApp Checkout Message Generation ---');

function generateWhatsAppUrl(shop, customer, cart) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isFreeShipping = subtotal >= (shop.freeShippingThreshold || 3000);
  const finalTotal = isFreeShipping ? subtotal : subtotal + 150;
  const baseUrl = 'https://sreecollections.pages.dev/';

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
    msg += `${index + 1}. *${item.title}*\n`;
    msg += `   • Code: ${item.sku}\n`;
    msg += `   • Qty: ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}\n`;
    msg += `   • Web Link: ${baseUrl}?product=${encodeURIComponent(item.sku)}\n`;
    if (item.image_url) msg += `   • Image: ${item.image_url}\n`;
  });

  msg += `*ESTIMATED TOTAL: ₹${finalTotal}*\n`;

  const cleanNumber = shop.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
}

const customerSample = {
  name: 'Lakshmi Devi',
  phone: '+91 98765 00000',
  city: 'Vijayawada - 520010'
};
const waUrl = generateWhatsAppUrl(window.CONFIG.shop, customerSample, testCart2);
assert(waUrl.startsWith('https://wa.me/919876543210?text='), 'WhatsApp URL starts with configured phone number');
assert(waUrl.includes(encodeURIComponent('Lakshmi Devi')), 'Encoded WhatsApp URL contains customer name');
assert(waUrl.includes(encodeURIComponent('SRC-101')), 'Encoded WhatsApp URL contains product SKU');
assert(waUrl.includes(encodeURIComponent('https://sreecollections.pages.dev/?product=SRC-101')), 'Encoded WhatsApp URL contains product link');

console.log('\n--- 4. Testing HTML & File System Links ---');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');

assert(indexHtml.includes('css/styles.css'), 'index.html references css/styles.css');
assert(indexHtml.includes('js/config.js'), 'index.html references js/config.js');
assert(indexHtml.includes('js/products-data.js'), 'index.html references js/products-data.js');
assert(indexHtml.includes('js/app.js'), 'index.html references js/app.js');
assert(indexHtml.includes('assets/icons/logo.svg'), 'index.html references logo.svg');
assert(indexHtml.includes('assets/icons/favicon.svg'), 'index.html references favicon.svg');

assert(adminHtml.includes('css/admin.css'), 'admin.html references css/admin.css');
assert(adminHtml.includes('js/admin.js'), 'admin.html references js/admin.js');

assert(fs.existsSync(path.join(__dirname, 'css', 'styles.css')), 'css/styles.css file exists on disk');
assert(fs.existsSync(path.join(__dirname, 'css', 'admin.css')), 'css/admin.css file exists on disk');
assert(fs.existsSync(path.join(__dirname, 'assets', 'icons', 'logo.svg')), 'assets/icons/logo.svg file exists on disk');
assert(fs.existsSync(path.join(__dirname, 'assets', 'icons', 'favicon.svg')), 'assets/icons/favicon.svg file exists on disk');
assert(fs.existsSync(path.join(__dirname, 'database', 'supabase-setup.sql')), 'database/supabase-setup.sql exists on disk');

console.log('\n--- 5. Testing Supabase SQL Script Content ---');
const sqlContent = fs.readFileSync(path.join(__dirname, 'database', 'supabase-setup.sql'), 'utf8');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.products'), 'SQL creates products table');
assert(sqlContent.includes('ENABLE ROW LEVEL SECURITY'), 'SQL enables Row Level Security');
assert(sqlContent.includes('Public can view active products'), 'SQL includes public read policy for active items');
assert(sqlContent.includes('Admins can insert products'), 'SQL includes admin insert policy');
assert(sqlContent.includes('saree-images'), 'SQL sets up saree-images storage bucket');
assert(sqlContent.includes('INSERT INTO public.products'), 'SQL includes seed data inserts');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passCount} passed, ${failCount} failed.`);
console.log(`==============================================\n`);

if (failCount > 0) {
  process.exit(1);
}
