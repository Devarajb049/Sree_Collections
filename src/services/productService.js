/**
 * SREE COLLECTIONS - Product Service Layer
 * -------------------------------------------------------------
 * Provides unified CRUD operations for sarees.
 * Connects to Supabase PostgreSQL & Storage when configured;
 * seamlessly falls back to LocalStorage demo inventory otherwise.
 */

import { supabase, isSupabaseConfigured, SHOP_CONFIG } from '../lib/supabase';
import { DEMO_PRODUCTS } from '../data/demoProducts';

const LOCAL_STORAGE_KEY = 'sree_admin_custom_products';

/**
 * Normalizes product records so both .name and .title are always available
 */
export function normalizeProduct(item) {
  if (!item) return null;
  const displayName = item.title || item.name || 'Sree Collections Saree';
  return {
    ...item,
    name: displayName,
    title: displayName,
    price: Number(item.price) || 0,
    original_price: item.original_price ? Number(item.original_price) : null,
    stock_quantity: item.stock_quantity !== undefined ? Number(item.stock_quantity) : 5,
    colors: Array.isArray(item.colors) ? item.colors : (item.color ? [item.color] : []),
    images: Array.isArray(item.images) ? item.images : (item.image_url ? [item.image_url] : [])
  };
}

// Whitelist of valid columns in public.products table (prevents schema cache errors)
const VALID_DB_COLUMNS = [
  'sku',
  'title',
  'slug',
  'category',
  'fabric',
  'color',
  'colors',
  'price',
  'original_price',
  'short_description',
  'description',
  'blouse_details',
  'zari_type',
  'saree_length',
  'care_instructions',
  'image_url',
  'images',
  'stock_quantity',
  'stock_status',
  'is_featured',
  'is_new_arrival',
  'is_best_seller',
  'is_active',
  'is_demo',
  'updated_at'
];

/**
 * Strips frontend-only aliases (like 'name') and prepares payload for Supabase PostgreSQL
 */
function prepareProductPayload(data) {
  const title = (data.title || data.name || 'Traditional Silk Saree').trim();
  const slug = data.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const fullPayload = {
    sku: (data.sku || `SRC-${Date.now().toString().slice(-4)}`).trim(),
    title: title,
    slug: slug,
    category: data.category || 'Kanchipuram Silk Sarees',
    fabric: data.fabric || 'Pure Silk',
    color: data.color || '',
    colors: Array.isArray(data.colors) ? data.colors : (data.color ? [data.color] : []),
    price: Number(data.price) || 0,
    original_price: data.original_price ? Number(data.original_price) : null,
    short_description: data.short_description || '',
    description: data.description || '',
    blouse_details: data.blouse_details || 'Running Blouse 80cm included',
    zari_type: data.zari_type || 'Tested Gold Zari',
    saree_length: data.saree_length || '6.3 Meters (including blouse)',
    care_instructions: data.care_instructions || 'Dry Clean Only',
    image_url: data.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    images: Array.isArray(data.images) && data.images.length > 0 ? data.images : (data.image_url ? [data.image_url] : []),
    stock_quantity: data.stock_quantity !== undefined ? Number(data.stock_quantity) : 5,
    stock_status: data.stock_status || (Number(data.stock_quantity) > 0 ? 'in_stock' : 'out_of_stock'),
    is_featured: Boolean(data.is_featured),
    is_new_arrival: Boolean(data.is_new_arrival),
    is_best_seller: Boolean(data.is_best_seller),
    is_active: data.is_active !== false,
    is_demo: Boolean(data.is_demo),
    updated_at: new Date().toISOString()
  };

  // Keep only existing columns
  const cleanDbPayload = {};
  for (const col of VALID_DB_COLUMNS) {
    if (fullPayload[col] !== undefined) {
      cleanDbPayload[col] = fullPayload[col];
    }
  }

  return cleanDbPayload;
}

// Helper to get local override products
function getLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map(normalizeProduct);
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  return DEMO_PRODUCTS.map(normalizeProduct);
}

function saveLocalProducts(products) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('LocalStorage write error:', e);
  }
}

/**
 * Fetch all active products for customer catalogue
 */
export async function getProducts({ category, search, sort = 'featured', inStockOnly = false } = {}) {
  let products = [];
  let isLive = false;

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (inStockOnly) {
        query = query.neq('stock_status', 'out_of_stock');
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        products = data.map(normalizeProduct);
        isLive = true;
      } else {
        products = getLocalProducts().filter(p => p.is_active);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local inventory:', err);
      products = getLocalProducts().filter(p => p.is_active);
    }
  } else {
    products = getLocalProducts().filter(p => p.is_active);
  }

  // Client-side filtering for category (if local data), search, and sorting
  if (category && category !== 'all' && !isLive) {
    products = products.filter(p => 
      p.category === category || 
      p.category_slug === category
    );
  }

  if (inStockOnly && !isLive) {
    products = products.filter(p => p.stock_status !== 'out_of_stock');
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    products = products.filter(p => {
      const matchName = (p.name || p.title || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      const matchFabric = (p.fabric || '').toLowerCase().includes(q);
      const matchColor = (p.color || '').toLowerCase().includes(q);
      const matchColors = Array.isArray(p.colors) && p.colors.some(c => c.toLowerCase().includes(q));
      return matchName || matchSku || matchFabric || matchColor || matchColors;
    });
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
      products.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case 'price-desc':
      products.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case 'newest':
      products.sort((a, b) => (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0));
      break;
    case 'discount':
      products.sort((a, b) => {
        const discA = a.original_price ? (a.original_price - a.price) / a.original_price : 0;
        const discB = b.original_price ? (b.original_price - b.price) / b.original_price : 0;
        return discB - discA;
      });
      break;
    case 'featured':
    default:
      products.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });
      break;
  }

  return { products, isLive };
}

/**
 * Fetch all products for admin dashboard (including inactive items)
 */
export async function getAdminProducts() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return { products: data.map(normalizeProduct), isLive: true };
      }
    } catch (e) {
      console.warn('Supabase admin products fetch error:', e);
    }
  }
  return { products: getLocalProducts(), isLive: false };
}

/**
 * Fetch a single product by ID or SKU or Slug
 */
export async function getProductById(id) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`id.eq.${id},sku.eq.${id},slug.eq.${id}`)
        .maybeSingle();

      if (!error && data) {
        return normalizeProduct(data);
      }
    } catch (e) {
      console.warn('Supabase single product fetch error:', e);
    }
  }

  const localList = getLocalProducts();
  return localList.find(p => p.id === id || p.sku === id || p.slug === id) || null;
}

/**
 * Upload an image file to Supabase Storage bucket 'saree-images'
 * With automatic data-URL fallback if storage bucket RLS is not yet configured.
 */
export async function uploadProductImage(file) {
  if (!file) return null;

  if (isSupabaseConfigured()) {
    try {
      const bucket = SHOP_CONFIG.storageBucket;
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `saree_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `inventory/${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload failed:', error.message, '- falling back to inline image encoding');
      }
    } catch (err) {
      console.warn('Supabase storage exception:', err, '- falling back to inline image encoding');
    }
  }

  // Graceful fallback to inline Data URL so saving products never fails
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80');
    reader.readAsDataURL(file);
  });
}

/**
 * Create a new saree product
 */
export async function createProduct(productData, imageFile) {
  let imageUrl = productData.image_url;

  if (imageFile) {
    imageUrl = await uploadProductImage(imageFile);
  }

  const cleanPayload = prepareProductPayload({
    ...productData,
    image_url: imageUrl || productData.image_url
  });

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([cleanPayload])
        .select()
        .single();

      if (!error && data) {
        return normalizeProduct(data);
      }
      if (error) {
        console.warn('Supabase insert error:', error.message, '- saving to local storage fallback');
        const products = getLocalProducts();
        const created = normalizeProduct({ ...cleanPayload, id: 'local-' + Date.now(), is_demo: false });
        products.unshift(created);
        saveLocalProducts(products);
        return created;
      }
    } catch (err) {
      console.warn('Supabase insert exception:', err);
      const products = getLocalProducts();
      const created = normalizeProduct({ ...cleanPayload, id: 'local-' + Date.now(), is_demo: false });
      products.unshift(created);
      saveLocalProducts(products);
      return created;
    }
  }

  const products = getLocalProducts();
  const created = normalizeProduct({ ...cleanPayload, id: 'demo-' + Date.now(), is_demo: true });
  products.unshift(created);
  saveLocalProducts(products);
  return created;
}

/**
 * Update an existing saree product
 */
export async function updateProduct(id, productData, imageFile) {
  let imageUrl = productData.image_url;

  if (imageFile) {
    imageUrl = await uploadProductImage(imageFile);
  }

  const cleanPayload = prepareProductPayload({
    ...productData,
    ...(imageUrl ? { image_url: imageUrl } : {})
  });

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(cleanPayload)
        .or(`id.eq.${id},sku.eq.${id}`)
        .select()
        .single();

      if (!error && data) {
        return normalizeProduct(data);
      }
      if (error) {
        console.warn('Supabase update error:', error.message, '- updating local storage fallback');
        const products = getLocalProducts();
        const index = products.findIndex(p => p.id === id || p.sku === id);
        if (index > -1) {
          products[index] = normalizeProduct({ ...products[index], ...cleanPayload });
          saveLocalProducts(products);
          return products[index];
        }
      }
    } catch (err) {
      console.warn('Supabase update exception:', err);
    }
  }

  const products = getLocalProducts();
  const index = products.findIndex(p => p.id === id || p.sku === id);
  if (index > -1) {
    products[index] = normalizeProduct({ ...products[index], ...cleanPayload });
    saveLocalProducts(products);
    return products[index];
  }
  throw new Error('Product not found in local inventory');
}

/**
 * Delete a saree product
 */
export async function deleteProduct(id) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .or(`id.eq.${id},sku.eq.${id}`);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }

  const products = getLocalProducts().filter(p => p.id !== id && p.sku !== id);
  saveLocalProducts(products);
  return true;
}

/**
 * Quick toggle of active visibility
 */
export async function toggleProductActive(id, newStatus) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},sku.eq.${id}`);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase toggle error:', e);
    }
  }

  const products = getLocalProducts();
  const item = products.find(p => p.id === id || p.sku === id);
  if (item) {
    item.is_active = newStatus;
    saveLocalProducts(products);
  }
  return true;
}

/**
 * Quick update of stock status
 */
export async function updateProductStock(id, newStockStatus, newQuantity) {
  const payload = {
    stock_status: newStockStatus,
    updated_at: new Date().toISOString(),
    ...(newQuantity !== undefined ? { stock_quantity: newQuantity } : {})
  };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .or(`id.eq.${id},sku.eq.${id}`);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase stock update error:', e);
    }
  }

  const products = getLocalProducts();
  const item = products.find(p => p.id === id || p.sku === id);
  if (item) {
    Object.assign(item, payload);
    saveLocalProducts(products);
  }
  return true;
}

/**
 * Seed 12 Curated Sarees to Supabase
 */
export async function seedDemoProductsToSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured in .env');
  }

  const itemsToInsert = DEMO_PRODUCTS.map(item => prepareProductPayload({
    sku: item.sku,
    title: item.name,
    category: item.category,
    fabric: item.fabric,
    colors: item.colors,
    price: item.price,
    original_price: item.original_price,
    short_description: item.short_description,
    description: item.description,
    blouse_details: item.blouse_details,
    zari_type: item.zari_type,
    saree_length: item.saree_length,
    care_instructions: item.care_instructions,
    image_url: item.image_url,
    stock_quantity: item.stock_quantity,
    stock_status: item.stock_status,
    is_featured: item.is_featured,
    is_new_arrival: item.is_new_arrival,
    is_best_seller: item.is_best_seller,
    is_active: item.is_active,
    is_demo: false
  }));

  const { data, error } = await supabase
    .from('products')
    .upsert(itemsToInsert, { onConflict: 'sku' })
    .select();

  if (error) throw error;
  return data;
}
