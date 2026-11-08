/**
 * SREE COLLECTIONS - Customer Storefront Application (js/app.js)
 * -------------------------------------------------------------------
 * Powers product catalogue, Supabase data fetching with demo fallback,
 * live search/filtering, shopping cart persistence, modal views,
 * and WhatsApp checkout integration.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    products: [],
    filteredProducts: [],
    categories: [],
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    stockFilter: 'all',
    fabricFilter: 'all',
    cart: [],
    selectedProduct: null,
    isSupabaseLive: false,
    currentLang: 'te', // 'en' | 'te'
    supabaseClient: null
  };

  // DOM Elements Cache
  const dom = {
    productsGrid: document.getElementById('productsGrid'),
    categoryPills: document.getElementById('categoryPills'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    sortSelect: document.getElementById('sortSelect'),
    stockFilterSelect: document.getElementById('stockFilterSelect'),
    fabricFilterSelect: document.getElementById('fabricFilterSelect'),
    resultsCount: document.getElementById('resultsCount'),
    demoBanner: document.getElementById('demoBanner'),
    
    // Cart Elements
    cartDrawerOverlay: document.getElementById('cartDrawerOverlay'),
    cartDrawer: document.getElementById('cartDrawer'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartBadge: document.getElementById('cartBadge'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    cartShipping: document.getElementById('cartShipping'),
    cartTotal: document.getElementById('cartTotal'),
    freeShippingBar: document.getElementById('freeShippingBar'),
    freeShippingText: document.getElementById('freeShippingText'),
    cartDrawerBody: document.getElementById('cartDrawerBody'),
    cartDrawerFooter: document.getElementById('cartDrawerFooter'),
    cartEmptyView: document.getElementById('cartEmptyView'),
    btnOpenCart: document.getElementById('btnOpenCart'),
    btnCloseCart: document.getElementById('btnCloseCart'),
    btnWhatsAppCheckout: document.getElementById('btnWhatsAppCheckout'),
    customerNameInput: document.getElementById('customerNameInput'),
    customerPhoneInput: document.getElementById('customerPhoneInput'),
    customerCityInput: document.getElementById('customerCityInput'),
    customerNotesInput: document.getElementById('customerNotesInput'),

    // Modal Elements
    productModalOverlay: document.getElementById('productModalOverlay'),
    modalProductContent: document.getElementById('modalProductContent'),
    btnCloseModal: document.getElementById('btnCloseModal'),

    // Mobile Nav
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    navMenu: document.getElementById('navMenu'),
    langToggleBtn: document.getElementById('langToggleBtn'),
    toastContainer: document.getElementById('toastContainer')
  };

  // ===================================================================
  // 1. INITIALIZATION & SUPABASE CONNECTION
  // ===================================================================
  async function initApp() {
    loadCartFromStorage();
    setupEventListeners();
    await initDataSources();
    renderCategories();
    applyFiltersAndSort();
    handleUrlParams();
  }

  async function initDataSources() {
    // Check if Supabase credentials are configured in js/config.js
    if (window.CONFIG && window.CONFIG.isSupabaseConfigured() && window.supabase) {
      try {
        state.supabaseClient = window.supabase.createClient(
          window.CONFIG.supabase.url,
          window.CONFIG.supabase.anonKey
        );

        // Fetch active products from Supabase
        const { data, error } = await state.supabaseClient
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          state.products = data;
          state.isSupabaseLive = true;
          if (dom.demoBanner) dom.demoBanner.style.display = 'none';
          showToast('Connected to live showroom inventory!', 'success');
        } else {
          loadFallbackDemoData('Supabase returned no active products.');
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to demo catalogue:', err);
        loadFallbackDemoData('Could not reach Supabase.');
      }
    } else {
      loadFallbackDemoData('Supabase not configured in js/config.js.');
    }

    // Populate categories list
    state.categories = window.CATEGORIES || [
      { id: 'all', name: 'All Sarees', nameTe: 'అన్ని రకాలు' }
    ];
    populateFabricFilter();
  }

  function loadFallbackDemoData(reason) {
    console.info(`Notice: ${reason} Displaying curated demo inventory.`);
    state.products = window.DEMO_PRODUCTS || [];
    state.isSupabaseLive = false;
    if (dom.demoBanner) {
      dom.demoBanner.style.display = 'flex';
    }
  }

  function populateFabricFilter() {
    if (!dom.fabricFilterSelect) return;
    const fabrics = new Set();
    state.products.forEach(p => {
      if (p.fabric) fabrics.add(p.fabric.trim());
    });

    let html = '<option value="all">All Fabrics (అన్ని ఫ్యాబ్రిక్స్)</option>';
    fabrics.forEach(f => {
      html += `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`;
    });
    dom.fabricFilterSelect.innerHTML = html;
  }

  // ===================================================================
  // 2. CATEGORY & FILTER LOGIC
  // ===================================================================
  function renderCategories() {
    if (!dom.categoryPills) return;
    const cats = state.categories;
    dom.categoryPills.innerHTML = cats.map(cat => `
      <button type="button" 
              class="category-pill-btn ${state.activeCategory === cat.id ? 'active' : ''}" 
              data-category="${escapeHtml(cat.id)}">
        <span>${escapeHtml(cat.name)}</span>
        <span class="pill-sub">${escapeHtml(cat.nameTe || '')}</span>
      </button>
    `).join('');

    // Attach click events
    dom.categoryPills.querySelectorAll('.category-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        setActiveCategory(catId);
      });
    });
  }

  function setActiveCategory(catId) {
    state.activeCategory = catId;
    renderCategories();
    applyFiltersAndSort();
    // Scroll smoothly to catalogue section if user clicked from top
    const catSection = document.getElementById('catalogue');
    if (catSection && window.scrollY < 200) {
      catSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function applyFiltersAndSort() {
    let result = [...state.products];

    // 1. Category Filter
    if (state.activeCategory !== 'all') {
      result = result.filter(p => p.category === state.activeCategory);
    }

    // 2. Search Query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const titleTeMatch = (p.title_te || '').toLowerCase().includes(q);
        const skuMatch = (p.sku || '').toLowerCase().includes(q);
        const fabricMatch = (p.fabric || '').toLowerCase().includes(q);
        const descMatch = (p.short_description || '').toLowerCase().includes(q);
        const colorsMatch = Array.isArray(p.colors) && p.colors.some(c => c.toLowerCase().includes(q));
        return titleMatch || titleTeMatch || skuMatch || fabricMatch || descMatch || colorsMatch;
      });
    }

    // 3. Stock Status Filter
    if (state.stockFilter === 'in_stock') {
      result = result.filter(p => p.stock_status !== 'out_of_stock' && (p.stock_quantity === undefined || p.stock_quantity > 0));
    }

    // 4. Fabric Filter
    if (state.fabricFilter !== 'all') {
      result = result.filter(p => p.fabric && p.fabric.trim() === state.fabricFilter);
    }

    // 5. Sorting
    switch (state.sortBy) {
      case 'price-asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
        result.sort((a, b) => (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0));
        break;
      case 'discount':
        result.sort((a, b) => {
          const discA = a.original_price ? (a.original_price - a.price) / a.original_price : 0;
          const discB = b.original_price ? (b.original_price - b.price) / b.original_price : 0;
          return discB - discA;
        });
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });
        break;
    }

    state.filteredProducts = result;
    renderProductsGrid();
    updateResultsMeta();
  }

  function updateResultsMeta() {
    if (!dom.resultsCount) return;
    const total = state.filteredProducts.length;
    dom.resultsCount.innerHTML = `Showing <strong>${total}</strong> ${total === 1 ? 'saree' : 'sarees'}`;
  }

  // ===================================================================
  // 3. PRODUCT CARDS RENDERING
  // ===================================================================
  function renderProductsGrid() {
    if (!dom.productsGrid) return;

    if (state.filteredProducts.length === 0) {
      dom.productsGrid.innerHTML = `
        <div class="catalogue-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No Sarees Found</h3>
          <p>We couldn't find any sarees matching your search or filters. Try adjusting your selections.</p>
          <button type="button" class="btn-primary-gold" style="margin-top: 1rem;" id="btnResetFilters">
            View All Sarees
          </button>
        </div>
      `;
      const resetBtn = document.getElementById('btnResetFilters');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetAllFilters);
      }
      return;
    }

    dom.productsGrid.innerHTML = state.filteredProducts.map(product => {
      const isOutOfStock = product.stock_status === 'out_of_stock' || (product.stock_quantity !== undefined && product.stock_quantity <= 0);
      const isLowStock = product.stock_status === 'low_stock' || (product.stock_quantity > 0 && product.stock_quantity <= 3);
      
      // Calculate Discount %
      let discountBadge = '';
      if (product.original_price && Number(product.original_price) > Number(product.price)) {
        const discPercent = Math.round(((product.original_price - product.price) / product.original_price) * 100);
        discountBadge = `<span class="badge badge-discount">${discPercent}% OFF</span>`;
      }

      // Stock status badge
      let stockBadge = `<span class="badge badge-in-stock">In Stock</span>`;
      if (isOutOfStock) {
        stockBadge = `<span class="badge badge-out-of-stock">Sold Out</span>`;
      } else if (isLowStock) {
        stockBadge = `<span class="badge badge-low-stock">Few Left</span>`;
      }

      // Demo badge if applicable
      const demoBadge = (product.is_demo || !state.isSupabaseLive) 
        ? `<span class="badge badge-demo" title="Sample inventory item for showcase">Demo Saree</span>` 
        : '';

      // Colors chips
      const colorsHtml = Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors.slice(0, 3).map(c => `<span class="color-dot">${escapeHtml(c)}</span>`).join('')
        : '';

      return `
        <article class="product-card" data-sku="${escapeHtml(product.sku)}">
          <div class="product-image-container" onclick="window.sreeStore.openDetailsModal('${escapeHtml(product.sku)}')">
            <img src="${escapeHtml(product.image_url)}" 
                 alt="${escapeHtml(product.title)}" 
                 loading="lazy" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';" />
            
            <div class="product-badges-top">
              ${demoBadge}
              ${product.is_featured ? '<span class="badge badge-featured">Featured</span>' : ''}
              ${product.is_new_arrival ? '<span class="badge badge-new">New Arrival</span>' : ''}
              ${discountBadge}
            </div>

            <div class="badge-stock">
              ${stockBadge}
            </div>

            <button type="button" class="quick-view-overlay-btn">
              Quick View / వివరాలు
            </button>
          </div>

          <div class="product-content">
            <div class="product-meta-sub">
              <span>${escapeHtml(product.category || '')}</span>
              <span class="product-sku">${escapeHtml(product.sku)}</span>
            </div>

            <h3 class="product-title" onclick="window.sreeStore.openDetailsModal('${escapeHtml(product.sku)}')">
              ${escapeHtml(product.title)}
            </h3>

            ${product.title_te ? `<div class="product-title-te">${escapeHtml(product.title_te)}</div>` : ''}

            <div class="product-fabric-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12h8"></path>
              </svg>
              <span>${escapeHtml(product.fabric || 'Pure Handloom Silk')}</span>
            </div>

            ${colorsHtml ? `<div class="product-colors-list">${colorsHtml}</div>` : ''}

            <div class="product-price-box">
              <span class="price-current">${formatPrice(product.price)}</span>
              ${product.original_price ? `<span class="price-original">${formatPrice(product.original_price)}</span>` : ''}
            </div>

            <div class="product-card-actions">
              <button type="button" 
                      class="btn-add-cart" 
                      ${isOutOfStock ? 'disabled' : ''} 
                      onclick="window.sreeStore.addToCart('${escapeHtml(product.sku)}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>${isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>

              <button type="button" 
                      class="btn-direct-whatsapp" 
                      title="Enquire & Order on WhatsApp" 
                      onclick="window.sreeStore.orderSingleProductWhatsApp('${escapeHtml(product.sku)}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // ===================================================================
  // 4. PRODUCT DETAILS MODAL
  // ===================================================================
  function openDetailsModal(sku) {
    const product = state.products.find(p => p.sku === sku);
    if (!product || !dom.productModalOverlay || !dom.modalProductContent) return;

    state.selectedProduct = product;
    const isOutOfStock = product.stock_status === 'out_of_stock' || (product.stock_quantity !== undefined && product.stock_quantity <= 0);

    let discountBadge = '';
    if (product.original_price && Number(product.original_price) > Number(product.price)) {
      const discPercent = Math.round(((product.original_price - product.price) / product.original_price) * 100);
      discountBadge = `<span class="badge badge-discount">${discPercent}% OFF</span>`;
    }

    dom.modalProductContent.innerHTML = `
      <div class="modal-content-grid">
        <div class="modal-image-col">
          <div class="modal-main-img">
            <img src="${escapeHtml(product.image_url)}" 
                 alt="${escapeHtml(product.title)}" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';" />
          </div>
          ${(product.is_demo || !state.isSupabaseLive) ? `
            <div style="font-size: 0.78rem; color: #8e6510; background: #fff9e6; border: 1px solid #fae8b4; padding: 6px 10px; border-radius: 4px; text-align: center;">
              ✨ Showroom Demo Model • 100% Handcrafted Guarantee
            </div>
          ` : ''}
        </div>

        <div class="modal-info-col">
          <div class="modal-sku-badge">${escapeHtml(product.category || '')} • SKU: ${escapeHtml(product.sku)}</div>
          <h2 class="modal-title">${escapeHtml(product.title)}</h2>
          ${product.title_te ? `<h3 class="modal-title-te">${escapeHtml(product.title_te)}</h3>` : ''}

          <div class="modal-price-box">
            <span class="modal-price-current">${formatPrice(product.price)}</span>
            ${product.original_price ? `<span class="price-original" style="font-size: 1.1rem;">${formatPrice(product.original_price)}</span>` : ''}
            ${discountBadge}
          </div>

          <div class="modal-desc">
            ${escapeHtml(product.description || product.short_description || 'Authentic traditional handloom saree crafted with finest natural fibers.')}
          </div>

          <table class="modal-specs-table">
            <tbody>
              <tr>
                <td>Fabric / మెటీరియల్:</td>
                <td><strong>${escapeHtml(product.fabric || 'Pure Silk')}</strong></td>
              </tr>
              <tr>
                <td>Zari Type:</td>
                <td>${escapeHtml(product.zari_type || 'Tested Gold Zari')}</td>
              </tr>
              <tr>
                <td>Blouse Details:</td>
                <td>${escapeHtml(product.blouse_details || 'Included with saree')}</td>
              </tr>
              <tr>
                <td>Length:</td>
                <td>${escapeHtml(product.saree_length || '6.3 Meters')}</td>
              </tr>
              <tr>
                <td>Care Instructions:</td>
                <td>${escapeHtml(product.care_instructions || 'Dry Clean Only')}</td>
              </tr>
              <tr>
                <td>Availability:</td>
                <td>
                  ${isOutOfStock 
                    ? '<span style="color: #c53030; font-weight: bold;">Out of Stock</span>' 
                    : '<span style="color: #1b7a42; font-weight: bold;">In Stock (Available for Instant Dispatch)</span>'}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="modal-actions-box">
            <div class="modal-btn-row">
              <button type="button" 
                      class="btn-add-cart" 
                      ${isOutOfStock ? 'disabled' : ''} 
                      onclick="window.sreeStore.addToCart('${escapeHtml(product.sku)}', true)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Add to Cart</span>
              </button>

              <button type="button" 
                      class="btn-whatsapp-checkout" 
                      onclick="window.sreeStore.orderSingleProductWhatsApp('${escapeHtml(product.sku)}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/>
                </svg>
                <span>WhatsApp Order</span>
              </button>
            </div>
            <div style="font-size: 0.8rem; color: #736962; text-align: center; margin-top: 4px;">
              ⚡ Video call viewing available on WhatsApp before dispatch
            </div>
          </div>
        </div>
      </div>
    `;

    dom.productModalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailsModal() {
    if (!dom.productModalOverlay) return;
    dom.productModalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    state.selectedProduct = null;
  }

  // ===================================================================
  // 5. SHOPPING CART MANAGEMENT
  // ===================================================================
  function loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('sree_cart_v1');
      if (saved) {
        state.cart = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage:', e);
      state.cart = [];
    }
    updateCartUI();
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem('sree_cart_v1', JSON.stringify(state.cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
    updateCartUI();
  }

  function addToCart(sku, closeDetails = false) {
    const product = state.products.find(p => p.sku === sku);
    if (!product) return;

    if (product.stock_status === 'out_of_stock' || (product.stock_quantity !== undefined && product.stock_quantity <= 0)) {
      showToast('Sorry, this saree is currently sold out!', 'error');
      return;
    }

    const existingIndex = state.cart.findIndex(item => item.sku === sku);
    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += 1;
    } else {
      state.cart.push({
        sku: product.sku,
        title: product.title,
        price: Number(product.price),
        image_url: product.image_url,
        fabric: product.fabric || 'Pure Silk',
        quantity: 1
      });
    }

    saveCartToStorage();
    showToast(`Added "${product.title}" to your cart!`, 'success');

    if (closeDetails) {
      closeDetailsModal();
    }
    openCartDrawer();
  }

  function updateItemQuantity(sku, delta) {
    const itemIndex = state.cart.findIndex(i => i.sku === sku);
    if (itemIndex === -1) return;

    const newQty = state.cart[itemIndex].quantity + delta;
    if (newQty <= 0) {
      removeFromCart(sku);
    } else {
      state.cart[itemIndex].quantity = newQty;
      saveCartToStorage();
    }
  }

  function removeFromCart(sku) {
    state.cart = state.cart.filter(i => i.sku !== sku);
    saveCartToStorage();
    showToast('Item removed from cart', 'info');
  }

  function clearCart() {
    state.cart = [];
    saveCartToStorage();
  }

  function updateCartUI() {
    // 1. Badge Counter
    const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (dom.cartBadge) {
      dom.cartBadge.textContent = totalQty;
      dom.cartBadge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
    }

    // 2. Cart Items Drawer Rendering
    if (!dom.cartItemsList) return;

    if (state.cart.length === 0) {
      if (dom.cartEmptyView) dom.cartEmptyView.style.display = 'block';
      if (dom.cartItemsList) dom.cartItemsList.style.display = 'none';
      if (dom.cartDrawerFooter) dom.cartDrawerFooter.style.display = 'none';
      return;
    }

    if (dom.cartEmptyView) dom.cartEmptyView.style.display = 'none';
    if (dom.cartItemsList) dom.cartItemsList.style.display = 'flex';
    if (dom.cartDrawerFooter) dom.cartDrawerFooter.style.display = 'flex';

    dom.cartItemsList.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}" />
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-title">${escapeHtml(item.title)}</h4>
          <span class="cart-item-fabric">${escapeHtml(item.fabric)} • ${escapeHtml(item.sku)}</span>
          <span class="cart-item-price">${formatPrice(item.price)}</span>
          
          <div class="cart-qty-controls">
            <button type="button" class="qty-btn" onclick="window.sreeStore.updateItemQuantity('${escapeHtml(item.sku)}', -1)">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button type="button" class="qty-btn" onclick="window.sreeStore.updateItemQuantity('${escapeHtml(item.sku)}', 1)">+</button>
          </div>
        </div>

        <button type="button" 
                class="cart-remove-item-btn" 
                title="Remove saree" 
                onclick="window.sreeStore.removeFromCart('${escapeHtml(item.sku)}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');

    // 3. Subtotal & Free Shipping Progress
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const threshold = (window.CONFIG && window.CONFIG.shop.freeShippingThreshold) || 3000;
    const isFreeShipping = subtotal >= threshold;

    if (dom.cartSubtotal) dom.cartSubtotal.textContent = formatPrice(subtotal);
    if (dom.cartShipping) dom.cartShipping.textContent = isFreeShipping ? 'FREE' : '₹150';
    if (dom.cartTotal) dom.cartTotal.textContent = formatPrice(isFreeShipping ? subtotal : subtotal + 150);

    // Free shipping bar
    if (dom.freeShippingBar && dom.freeShippingText) {
      if (isFreeShipping) {
        dom.freeShippingBar.style.width = '100%';
        dom.freeShippingText.innerHTML = '🎉 Congratulations! You have unlocked <strong>FREE Insured Express Delivery</strong> across India!';
      } else {
        const remaining = threshold - subtotal;
        const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
        dom.freeShippingBar.style.width = `${percent}%`;
        dom.freeShippingText.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more to get <strong>FREE Express Shipping</strong>!`;
      }
    }
  }

  function openCartDrawer() {
    if (!dom.cartDrawerOverlay) return;
    dom.cartDrawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (!dom.cartDrawerOverlay) return;
    dom.cartDrawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ===================================================================
  // 6. WHATSAPP CHECKOUT GENERATOR
  // ===================================================================
  function proceedToWhatsAppCheckout() {
    if (state.cart.length === 0) {
      showToast('Your cart is empty. Please add sarees first!', 'error');
      return;
    }

    const shopCfg = window.CONFIG ? window.CONFIG.shop : {
      whatsappNumber: '919876543210',
      name: 'Sree Collections',
      freeShippingThreshold: 3000
    };

    const customerName = dom.customerNameInput ? dom.customerNameInput.value.trim() : '';
    const customerPhone = dom.customerPhoneInput ? dom.customerPhoneInput.value.trim() : '';
    const customerCity = dom.customerCityInput ? dom.customerCityInput.value.trim() : '';
    const customerNotes = dom.customerNotesInput ? dom.customerNotesInput.value.trim() : '';

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isFreeShipping = subtotal >= (shopCfg.freeShippingThreshold || 3000);
    const deliveryAmount = isFreeShipping ? 0 : 150;
    const finalTotal = subtotal + deliveryAmount;

    // Current page URL for product links
    const baseUrl = window.location.origin + window.location.pathname;

    let msg = `*NAMASTE ${shopCfg.name.toUpperCase()}!*\n`;
    msg += `I would like to place an order from your website catalogue:\n\n`;

    if (customerName || customerCity || customerPhone) {
      msg += `*CUSTOMER DETAILS:*\n`;
      if (customerName) msg += `• Name: ${customerName}\n`;
      if (customerPhone) msg += `• Phone: ${customerPhone}\n`;
      if (customerCity) msg += `• Delivery City/Pincode: ${customerCity}\n`;
      if (customerNotes) msg += `• Special Notes: ${customerNotes}\n`;
      msg += `\n`;
    }

    msg += `*ORDERED SAREES (${state.cart.length} item${state.cart.length > 1 ? 's' : ''}):*\n`;
    state.cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      msg += `----------------------------------------\n`;
      msg += `${index + 1}. *${item.title}*\n`;
      msg += `   • Code: ${item.sku}\n`;
      msg += `   • Fabric: ${item.fabric}\n`;
      msg += `   • Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${itemTotal.toLocaleString('en-IN')}\n`;
      msg += `   • Web Link: ${baseUrl}?product=${encodeURIComponent(item.sku)}\n`;
      if (item.image_url) {
        msg += `   • Image: ${item.image_url}\n`;
      }
    });

    msg += `----------------------------------------\n`;
    msg += `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    msg += `*Shipping:* ${isFreeShipping ? 'FREE (Orders over ₹3,000)' : '₹150'}\n`;
    msg += `*ESTIMATED TOTAL: ₹${finalTotal.toLocaleString('en-IN')}*\n`;
    msg += `----------------------------------------\n\n`;
    msg += `Please confirm availability and share payment options (UPI/GPay/PhonePe/Bank Transfer). Thank you!`;

    const encodedMsg = encodeURIComponent(msg);
    const cleanNumber = shopCfg.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  function orderSingleProductWhatsApp(sku) {
    const product = state.products.find(p => p.sku === sku);
    if (!product) return;

    const shopCfg = window.CONFIG ? window.CONFIG.shop : {
      whatsappNumber: '919876543210',
      name: 'Sree Collections'
    };

    const baseUrl = window.location.origin + window.location.pathname;

    let msg = `*NAMASTE ${shopCfg.name.toUpperCase()}!*\n`;
    msg += `I am interested in this saree from your catalogue:\n\n`;
    msg += `*SAREE DETAILS:*\n`;
    msg += `• Name: *${product.title}*\n`;
    if (product.title_te) msg += `• పేరు: ${product.title_te}\n`;
    msg += `• Product Code: ${product.sku}\n`;
    msg += `• Price: ₹${Number(product.price).toLocaleString('en-IN')}\n`;
    msg += `• Fabric: ${product.fabric || 'Pure Silk'}\n`;
    msg += `• Web Link: ${baseUrl}?product=${encodeURIComponent(product.sku)}\n`;
    if (product.image_url) {
      msg += `• Image: ${product.image_url}\n`;
    }
    msg += `\nIs this saree available for dispatch? Can you please share a quick video or more photos on WhatsApp? Thank you!`;

    const encodedMsg = encodeURIComponent(msg);
    const cleanNumber = shopCfg.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  // ===================================================================
  // 7. EVENT LISTENERS & UI WIRING
  // ===================================================================
  function setupEventListeners() {
    // Search input (with debounce)
    let searchTimeout;
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const val = e.target.value;
        if (dom.clearSearchBtn) {
          dom.clearSearchBtn.style.display = val.trim() ? 'block' : 'none';
        }
        searchTimeout = setTimeout(() => {
          state.searchQuery = val;
          applyFiltersAndSort();
        }, 250);
      });
    }

    if (dom.clearSearchBtn) {
      dom.clearSearchBtn.addEventListener('click', () => {
        if (dom.searchInput) dom.searchInput.value = '';
        dom.clearSearchBtn.style.display = 'none';
        state.searchQuery = '';
        applyFiltersAndSort();
      });
    }

    // Sort selection
    if (dom.sortSelect) {
      dom.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFiltersAndSort();
      });
    }

    // Stock Filter
    if (dom.stockFilterSelect) {
      dom.stockFilterSelect.addEventListener('change', (e) => {
        state.stockFilter = e.target.value;
        applyFiltersAndSort();
      });
    }

    // Fabric Filter
    if (dom.fabricFilterSelect) {
      dom.fabricFilterSelect.addEventListener('change', (e) => {
        state.fabricFilter = e.target.value;
        applyFiltersAndSort();
      });
    }

    // Cart Drawer triggers
    if (dom.btnOpenCart) dom.btnOpenCart.addEventListener('click', openCartDrawer);
    if (dom.btnCloseCart) dom.btnCloseCart.addEventListener('click', closeCartDrawer);
    if (dom.cartDrawerOverlay) {
      dom.cartDrawerOverlay.addEventListener('click', (e) => {
        if (e.target === dom.cartDrawerOverlay) closeCartDrawer();
      });
    }

    // WhatsApp Checkout trigger
    if (dom.btnWhatsAppCheckout) {
      dom.btnWhatsAppCheckout.addEventListener('click', proceedToWhatsAppCheckout);
    }

    // Modal triggers
    if (dom.btnCloseModal) dom.btnCloseModal.addEventListener('click', closeDetailsModal);
    if (dom.productModalOverlay) {
      dom.productModalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.productModalOverlay) closeDetailsModal();
      });
    }

    // Keyboard Escape to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailsModal();
        closeCartDrawer();
      }
    });

    // Mobile Hamburger Menu
    if (dom.mobileMenuToggle && dom.navMenu) {
      dom.mobileMenuToggle.addEventListener('click', () => {
        dom.navMenu.classList.toggle('open');
      });

      // Close menu when clicking any nav link
      dom.navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          dom.navMenu.classList.remove('open');
        });
      });
    }

    // Language Toggle Button (Bilingual Support)
    if (dom.langToggleBtn) {
      dom.langToggleBtn.addEventListener('click', toggleLanguage);
    }
  }

  function resetAllFilters() {
    state.activeCategory = 'all';
    state.searchQuery = '';
    state.sortBy = 'featured';
    state.stockFilter = 'all';
    state.fabricFilter = 'all';

    if (dom.searchInput) dom.searchInput.value = '';
    if (dom.clearSearchBtn) dom.clearSearchBtn.style.display = 'none';
    if (dom.sortSelect) dom.sortSelect.value = 'featured';
    if (dom.stockFilterSelect) dom.stockFilterSelect.value = 'all';
    if (dom.fabricFilterSelect) dom.fabricFilterSelect.value = 'all';

    renderCategories();
    applyFiltersAndSort();
  }

  function toggleLanguage() {
    state.currentLang = state.currentLang === 'en' ? 'te' : 'en';
    if (dom.langToggleBtn) {
      dom.langToggleBtn.innerHTML = state.currentLang === 'en' ? '🇮🇳 తె / Telugu' : '🇬🇧 English';
    }
    showToast(`Language switched to ${state.currentLang === 'en' ? 'English' : 'తెలుగు'}`, 'info');
  }

  function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const productSku = params.get('product');
    if (productSku) {
      setTimeout(() => {
        openDetailsModal(productSku);
      }, 300);
    }
  }

  // ===================================================================
  // 8. HELPERS & UTILITIES
  // ===================================================================
  function formatPrice(amount) {
    if (amount === undefined || amount === null) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    if (!dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
    `;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Expose public API for HTML onclick attributes
  window.sreeStore = {
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    openDetailsModal,
    closeDetailsModal,
    openCartDrawer,
    closeCartDrawer,
    orderSingleProductWhatsApp,
    proceedToWhatsAppCheckout,
    resetAllFilters,
    showToast
  };

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', initApp);

})();
