/**
 * SREE COLLECTIONS - Supabase Client & Central Configuration
 * -------------------------------------------------------------
 * Creates a reusable Supabase client for PostgreSQL, Auth, and Storage.
 * Reads environment variables from Vite (import.meta.env).
 * NEVER import or expose the service_role key in frontend code!
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

// Create client with fallback safe dummy credentials if unconfigured
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://unconfigured-placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'unconfigured-placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Centralized Shop Configuration
export const SHOP_CONFIG = {
  name: import.meta.env.VITE_SHOP_NAME || 'Sree Collections',
  tagline: 'Authentic Heritage & Pure Silk Sarees',
  whatsappNumber: import.meta.env.VITE_SHOP_WHATSAPP || '919876543210',
  phoneNumber: import.meta.env.VITE_SHOP_PHONE || '+91 98765 43210',
  email: import.meta.env.VITE_SHOP_EMAIL || 'orders@sreecollections.com',
  address: import.meta.env.VITE_SHOP_ADDRESS || 'Door No. 40-1-52, MG Road, Near Benz Circle, Vijayawada, Andhra Pradesh - 520010',
  workingHours: '10:00 AM - 09:00 PM (All 7 Days)',
  freeShippingThreshold: 3000,
  currency: 'INR',
  currencySymbol: '₹',
  storageBucket: 'saree-images'
};
