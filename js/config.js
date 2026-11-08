/**
 * SREE COLLECTIONS - Application Configuration
 * -------------------------------------------------------------
 * Central configuration file for Sree Collections Saree E-Commerce Website.
 * Update your WhatsApp number and Supabase credentials here.
 * 
 * NOTE: For Cloudflare Pages deployment, this file is loaded client-side.
 * Only the Supabase anonymous (publishable) key should be used here.
 * NEVER paste your Supabase 'service_role' secret key here!
 */

const CONFIG = {
  // Business Information
  shop: {
    name: "Sree Collections",
    nameTe: "శ్రీ కలెక్షన్స్",
    tagline: "Authentic Heritage & Pure Silk Sarees",
    taglineTe: "సంప్రదాయ కళానైపుణ్యం & పట్టు చీరల దివ్య సమాహారం",
    phone: "+91 98765 43210",
    phoneDisplay: "+91 98765 43210",
    // WhatsApp number for receiving customer orders (Include country code without '+' or special characters, e.g. '919876543210')
    whatsappNumber: "919876543210",
    email: "orders@sreecollections.com",
    address: "Door No. 40-1-52, MG Road, Near Benz Circle, Vijayawada, Andhra Pradesh - 520010, India",
    addressTe: "డోర్ నెం. 40-1-52, ఎం.జి. రోడ్, బెంజ్ సర్కిల్ దగ్గర, విజయవాడ, ఆంధ్రప్రదేశ్ - 520010",
    workingHours: "10:00 AM - 09:00 PM (All 7 Days)",
    currency: "INR",
    currencySymbol: "₹",
    freeShippingThreshold: 3000 // Free delivery in INR
  },

  // Supabase Backend Configuration
  // Replace these with your actual Supabase project settings from:
  // Supabase Dashboard -> Project Settings -> API
  supabase: {
    url: "YOUR_SUPABASE_PROJECT_URL", // e.g. "https://xyzcompany.supabase.co"
    anonKey: "YOUR_SUPABASE_ANON_KEY", // Your public anon / publishable key
    storageBucket: "saree-images"      // Public storage bucket for uploaded saree photos
  },

  // Helper method to verify if Supabase credentials have been configured
  isSupabaseConfigured() {
    return (
      this.supabase.url &&
      this.supabase.anonKey &&
      !this.supabase.url.includes("YOUR_SUPABASE_PROJECT_URL") &&
      !this.supabase.anonKey.includes("YOUR_SUPABASE_ANON_KEY")
    );
  }
};

// Make CONFIG globally accessible in browser scripts
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
