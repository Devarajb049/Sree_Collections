/**
 * SREE COLLECTIONS - Admin Dashboard Application (js/admin.js)
 * -------------------------------------------------------------------
 * Powers Supabase Authentication, Product Inventory Management (CRUD),
 * Supabase Storage Image Uploads, Stock Status Controls, and
 * Demo / Disconnected Mode testing.
 */

(function () {
  'use strict';

  // Admin State
  const state = {
    user: null,
    isDemoMode: false,
    products: [],
    filteredProducts: [],
    editingProductId: null,
    searchQuery: '',
    categoryFilter: 'all',
    stockFilter: 'all',
    visibilityFilter: 'all',
    supabaseClient: null
  };

  // DOM Elements Cache
  const dom = {
    // Views
    loginView: document.getElementById('loginView'),
    dashboardView: document.getElementById('dashboardView'),
    
    // Login Elements
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginErrorAlert: document.getElementById('loginErrorAlert'),
    loginNotice: document.getElementById('loginNotice'),
    btnDemoLogin: document.getElementById('btnDemoLogin'),
    
    // Topbar
    adminUserEmail: document.getElementById('adminUserEmail'),
    btnLogout: document.getElementById('btnLogout'),
    
    // Stats
    statTotal: document.getElementById('statTotal'),
    statActive: document.getElementById('statActive'),
    statStockAlerts: document.getElementById('statStockAlerts'),
    statCategories: document.getElementById('statCategories'),
    
    // Toolbar & Table
    adminSearchInput: document.getElementById('adminSearchInput'),
    adminCategorySelect: document.getElementById('adminCategorySelect'),
    adminStockSelect: document.getElementById('adminStockSelect'),
    adminVisibilitySelect: document.getElementById('adminVisibilitySelect'),
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    btnSeedDemoData: document.getElementById('btnSeedDemoData'),
    productsTableBody: document.getElementById('productsTableBody'),
    
    // Product Modal
    productModal: document.getElementById('productModal'),
    modalTitle: document.getElementById('modalTitle'),
    productForm: document.getElementById('productForm'),
    btnCloseProductModal: document.getElementById('btnCloseProductModal'),
    btnCancelProductModal: document.getElementById('btnCancelProductModal'),
    
    // Form Inputs
    inputSku: document.getElementById('inputSku'),
    inputTitle: document.getElementById('inputTitle'),
    inputTitleTe: document.getElementById('inputTitleTe'),
    inputCategory: document.getElementById('inputCategory'),
    inputFabric: document.getElementById('inputFabric'),
    inputColors: document.getElementById('inputColors'),
    inputPrice: document.getElementById('inputPrice'),
    inputOriginalPrice: document.getElementById('inputOriginalPrice'),
    inputStockQty: document.getElementById('inputStockQty'),
    inputStockStatus: document.getElementById('inputStockStatus'),
    inputShortDesc: document.getElementById('inputShortDesc'),
    inputDescription: document.getElementById('inputDescription'),
    inputBlouse: document.getElementById('inputBlouse'),
    inputZari: document.getElementById('inputZari'),
    inputLength: document.getElementById('inputLength'),
    inputCare: document.getElementById('inputCare'),
    inputImageUrl: document.getElementById('inputImageUrl'),
    inputFileImage: document.getElementById('inputFileImage'),
    imagePreviewBox: document.getElementById('imagePreviewBox'),
    checkFeatured: document.getElementById('checkFeatured'),
    checkNewArrival: document.getElementById('checkNewArrival'),
    checkBestSeller: document.getElementById('checkBestSeller'),
    checkActive: document.getElementById('checkActive'),

    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteItemName: document.getElementById('deleteItemName'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),

    // Toast
    toastContainer: document.getElementById('adminToastContainer')
  };

  let pendingDeleteId = null;

  // ===================================================================
  // 1. INITIALIZATION & AUTH STATE
  // ===================================================================
  async function initAdmin() {
    setupEventListeners();

    // Check if Supabase credentials are configured in js/config.js
    if (window.CONFIG && window.CONFIG.isSupabaseConfigured() && window.supabase) {
      state.supabaseClient = window.supabase.createClient(
        window.CONFIG.supabase.url,
        window.CONFIG.supabase.anonKey
      );

      // Listen to auth changes
      state.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          state.user = session.user;
          state.isDemoMode = false;
          showDashboard();
        } else if (!state.isDemoMode) {
          showLogin();
        }
      });

      // Check current session
      const { data: { session } } = await state.supabaseClient.auth.getSession();
      if (session && session.user) {
        state.user = session.user;
        state.isDemoMode = false;
        showDashboard();
      } else {
        showLogin();
      }
    } else {
      // Supabase is not configured yet
      showLoginNotice();
      showLogin();
    }
  }

  function showLoginNotice() {
    if (dom.loginNotice) {
      dom.loginNotice.innerHTML = `
        <strong>⚙️ Supabase Setup Pending:</strong><br />
        Configure your Supabase project URL and anon key in <code>js/config.js</code> to enable PostgreSQL authentication.
        <br /><br />
        In the meantime, you can test all admin features (Add, Edit, Stock updates, Delete) using <strong>Local Demo Mode</strong> below!
      `;
    }
  }

  function showLogin() {
    dom.loginView.style.display = 'flex';
    dom.dashboardView.style.display = 'none';
  }

  function showDashboard() {
    dom.loginView.style.display = 'none';
    dom.dashboardView.style.display = 'flex';

    if (state.isDemoMode) {
      dom.adminUserEmail.textContent = 'Demo Admin (Local Mode)';
      if (dom.btnSeedDemoData) dom.btnSeedDemoData.style.display = 'none';
    } else if (state.user) {
      dom.adminUserEmail.textContent = state.user.email || 'Admin';
      if (dom.btnSeedDemoData) dom.btnSeedDemoData.style.display = 'inline-flex';
    }

    loadProducts();
  }

  // ===================================================================
  // 2. AUTHENTICATION ACTIONS
  // ===================================================================
  async function handleLogin(e) {
    e.preventDefault();
    hideLoginError();

    const email = dom.loginEmail.value.trim();
    const password = dom.loginPassword.value;

    if (!email || !password) {
      showLoginError('Please enter both email and password.');
      return;
    }

    if (state.supabaseClient && window.CONFIG.isSupabaseConfigured()) {
      try {
        const { data, error } = await state.supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          showLoginError(error.message);
        } else if (data && data.user) {
          state.user = data.user;
          state.isDemoMode = false;
          showDashboard();
          showToast('Logged in successfully!', 'success');
        }
      } catch (err) {
        showLoginError('Connection error while contacting Supabase. Check network/config.');
      }
    } else {
      // Supabase not configured: allow demo bypass
      enterDemoMode();
    }
  }

  function enterDemoMode() {
    state.isDemoMode = true;
    state.user = { email: 'admin@sreecollections.demo' };
    showDashboard();
    showToast('Entered Demo Admin Mode (LocalStorage)', 'info');
  }

  async function handleLogout() {
    if (state.supabaseClient && !state.isDemoMode) {
      await state.supabaseClient.auth.signOut();
    }
    state.user = null;
    state.isDemoMode = false;
    showLogin();
    showToast('Logged out securely.', 'info');
  }

  function showLoginError(msg) {
    if (dom.loginErrorAlert) {
      dom.loginErrorAlert.textContent = msg;
      dom.loginErrorAlert.style.display = 'block';
    }
  }

  function hideLoginError() {
    if (dom.loginErrorAlert) {
      dom.loginErrorAlert.style.display = 'none';
    }
  }

  // ===================================================================
  // 3. PRODUCT DATA FETCHING & STORAGE
  // ===================================================================
  async function loadProducts() {
    if (state.supabaseClient && !state.isDemoMode) {
      try {
        const { data, error } = await state.supabaseClient
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          state.products = data;
        } else {
          showToast('Could not fetch products from Supabase: ' + (error ? error.message : ''), 'error');
          state.products = [];
        }
      } catch (e) {
        console.error('Error loading products:', e);
        state.products = [];
      }
    } else {
      // Demo Mode: Load from localStorage
      const saved = localStorage.getItem('sree_admin_demo_products');
      if (saved) {
        try {
          state.products = JSON.parse(saved);
        } catch (e) {
          state.products = window.DEMO_PRODUCTS ? [...window.DEMO_PRODUCTS] : [];
        }
      } else {
        state.products = window.DEMO_PRODUCTS ? [...window.DEMO_PRODUCTS] : [];
        saveDemoProducts();
      }
    }

    populateCategoryFilter();
    applyTableFilters();
    updateDashboardStats();
  }

  function saveDemoProducts() {
    try {
      localStorage.setItem('sree_admin_demo_products', JSON.stringify(state.products));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  function updateDashboardStats() {
    const total = state.products.length;
    const active = state.products.filter(p => p.is_active).length;
    const stockAlerts = state.products.filter(p => p.stock_status === 'out_of_stock' || p.stock_status === 'low_stock' || (p.stock_quantity !== undefined && p.stock_quantity <= 2)).length;
    
    const categoriesSet = new Set();
    state.products.forEach(p => { if (p.category) categoriesSet.add(p.category); });

    if (dom.statTotal) dom.statTotal.textContent = total;
    if (dom.statActive) dom.statActive.textContent = active;
    if (dom.statStockAlerts) dom.statStockAlerts.textContent = stockAlerts;
    if (dom.statCategories) dom.statCategories.textContent = categoriesSet.size;
  }

  function populateCategoryFilter() {
    if (!dom.adminCategorySelect) return;
    const categoriesSet = new Set();
    state.products.forEach(p => { if (p.category) categoriesSet.add(p.category); });

    let options = '<option value="all">All Categories</option>';
    categoriesSet.forEach(c => {
      options += `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`;
    });
    dom.adminCategorySelect.innerHTML = options;
  }

  // ===================================================================
  // 4. TABLE FILTERING & RENDERING
  // ===================================================================
  function applyTableFilters() {
    let result = [...state.products];

    // Search
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        return (p.title || '').toLowerCase().includes(q) ||
               (p.title_te || '').toLowerCase().includes(q) ||
               (p.sku || '').toLowerCase().includes(q) ||
               (p.category || '').toLowerCase().includes(q) ||
               (p.fabric || '').toLowerCase().includes(q);
      });
    }

    // Category
    if (state.categoryFilter !== 'all') {
      result = result.filter(p => p.category === state.categoryFilter);
    }

    // Stock Status
    if (state.stockFilter !== 'all') {
      result = result.filter(p => p.stock_status === state.stockFilter);
    }

    // Visibility
    if (state.visibilityFilter === 'active') {
      result = result.filter(p => p.is_active);
    } else if (state.visibilityFilter === 'hidden') {
      result = result.filter(p => !p.is_active);
    }

    state.filteredProducts = result;
    renderTable();
  }

  function renderTable() {
    if (!dom.productsTableBody) return;

    if (state.filteredProducts.length === 0) {
      dom.productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: #8c827a;">
            No sarees found matching your criteria.
          </td>
        </tr>
      `;
      return;
    }

    dom.productsTableBody.innerHTML = state.filteredProducts.map(product => {
      const isOut = product.stock_status === 'out_of_stock';
      const isLow = product.stock_status === 'low_stock';
      let stockBadge = `<span class="table-badge table-badge-instock">In Stock (${product.stock_quantity ?? 5})</span>`;
      if (isOut) {
        stockBadge = `<span class="table-badge table-badge-soldout">Sold Out (0)</span>`;
      } else if (isLow) {
        stockBadge = `<span class="table-badge table-badge-lowstock">Low Stock (${product.stock_quantity ?? 1})</span>`;
      }

      const activeBadge = product.is_active
        ? `<span class="table-badge table-badge-active">Visible</span>`
        : `<span class="table-badge table-badge-hidden">Hidden</span>`;

      return `
        <tr data-id="${escapeHtml(product.id || product.sku)}">
          <td>
            <img src="${escapeHtml(product.image_url)}" 
                 alt="${escapeHtml(product.title)}" 
                 class="table-img-thumb" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80';" />
          </td>
          <td class="table-title-cell">
            <strong>${escapeHtml(product.title)}</strong>
            <span>${escapeHtml(product.title_te || '')} • SKU: ${escapeHtml(product.sku)}</span>
          </td>
          <td>
            <div>${escapeHtml(product.category)}</div>
            <small style="color: #6b6059;">${escapeHtml(product.fabric || 'Pure Silk')}</small>
          </td>
          <td>
            <strong>₹${Number(product.price).toLocaleString('en-IN')}</strong>
            ${product.original_price ? `<br><small style="text-decoration: line-through; color: #8c827a;">₹${Number(product.original_price).toLocaleString('en-IN')}</small>` : ''}
          </td>
          <td>
            ${stockBadge}
            <div style="margin-top: 4px;">
              <select onchange="window.sreeAdmin.quickUpdateStock('${escapeHtml(product.id || product.sku)}', this.value)" 
                      style="font-size: 0.75rem; padding: 2px 4px; border: 1px solid #d0c4b4; border-radius: 4px;">
                <option value="in_stock" ${product.stock_status === 'in_stock' ? 'selected' : ''}>Set In Stock</option>
                <option value="low_stock" ${product.stock_status === 'low_stock' ? 'selected' : ''}>Set Low Stock</option>
                <option value="out_of_stock" ${product.stock_status === 'out_of_stock' ? 'selected' : ''}>Mark Sold Out</option>
              </select>
            </div>
          </td>
          <td>
            ${activeBadge}
            <div style="margin-top: 4px;">
              <button type="button" 
                      class="btn-table-action" 
                      style="font-size: 0.72rem; padding: 2px 6px;"
                      onclick="window.sreeAdmin.quickToggleVisibility('${escapeHtml(product.id || product.sku)}')">
                ${product.is_active ? 'Hide Saree' : 'Show Saree'}
              </button>
            </div>
          </td>
          <td>
            <div class="table-actions-cell">
              <button type="button" 
                      class="btn-table-action" 
                      title="Edit Saree" 
                      onclick="window.sreeAdmin.openEditModal('${escapeHtml(product.id || product.sku)}')">
                ✏️ Edit
              </button>
              <button type="button" 
                      class="btn-table-action btn-table-delete" 
                      title="Delete Saree" 
                      onclick="window.sreeAdmin.openDeleteConfirm('${escapeHtml(product.id || product.sku)}')">
                🗑️ Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ===================================================================
  // 5. PRODUCT ADD / EDIT MODAL & SUPABASE STORAGE
  // ===================================================================
  function openAddModal() {
    state.editingProductId = null;
    if (dom.modalTitle) dom.modalTitle.textContent = 'Add New Saree to Showroom';
    if (dom.productForm) dom.productForm.reset();
    if (dom.imagePreviewBox) dom.imagePreviewBox.innerHTML = '<span>Preview</span>';

    // Auto-generate fresh SKU
    const nextNum = state.products.length + 101;
    if (dom.inputSku) dom.inputSku.value = `SRC-${nextNum}`;
    if (dom.checkActive) dom.checkActive.checked = true;
    if (dom.inputStockQty) dom.inputStockQty.value = 5;

    dom.productModal.classList.add('open');
  }

  function openEditModal(identifier) {
    const product = state.products.find(p => (p.id && p.id === identifier) || p.sku === identifier);
    if (!product) return;

    state.editingProductId = identifier;
    if (dom.modalTitle) dom.modalTitle.textContent = `Edit Saree: ${product.title}`;

    // Fill form
    dom.inputSku.value = product.sku || '';
    dom.inputTitle.value = product.title || '';
    dom.inputTitleTe.value = product.title_te || '';
    dom.inputCategory.value = product.category || 'Kanchipuram Silk Sarees';
    dom.inputFabric.value = product.fabric || '';
    dom.inputColors.value = Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || '');
    dom.inputPrice.value = product.price || '';
    dom.inputOriginalPrice.value = product.original_price || '';
    dom.inputStockQty.value = product.stock_quantity ?? 5;
    dom.inputStockStatus.value = product.stock_status || 'in_stock';
    dom.inputShortDesc.value = product.short_description || '';
    dom.inputDescription.value = product.description || '';
    dom.inputBlouse.value = product.blouse_details || '';
    dom.inputZari.value = product.zari_type || '';
    dom.inputLength.value = product.saree_length || '6.3 Meters (with blouse)';
    dom.inputCare.value = product.care_instructions || 'Dry Clean Only';
    dom.inputImageUrl.value = product.image_url || '';

    dom.checkFeatured.checked = !!product.is_featured;
    dom.checkNewArrival.checked = !!product.is_new_arrival;
    dom.checkBestSeller.checked = !!product.is_best_seller;
    dom.checkActive.checked = product.is_active !== false;

    // Show preview
    if (product.image_url && dom.imagePreviewBox) {
      dom.imagePreviewBox.innerHTML = `<img src="${escapeHtml(product.image_url)}" alt="Preview" />`;
    }

    dom.productModal.classList.add('open');
  }

  function closeProductModal() {
    dom.productModal.classList.remove('open');
    state.editingProductId = null;
  }

  // Handle image upload to Supabase Storage
  async function uploadImageToStorage(file) {
    if (!file) return null;

    if (state.supabaseClient && !state.isDemoMode) {
      const bucket = (window.CONFIG && window.CONFIG.supabase && window.CONFIG.supabase.storageBucket) || 'saree-images';
      const fileExt = file.name.split('.').pop();
      const fileName = `saree_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `inventory/${fileName}`;

      showToast('Uploading saree photo to Supabase storage...', 'info');
      const { data, error } = await state.supabaseClient.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error('Supabase Storage Error: ' + error.message);
      }

      // Retrieve public URL
      const { data: publicUrlData } = state.supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } else {
      // Demo / Local Mode fallback: convert file to local object URL / Data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  }

  async function handleProductFormSubmit(e) {
    e.preventDefault();

    const title = dom.inputTitle.value.trim();
    const sku = dom.inputSku.value.trim().toUpperCase();
    const category = dom.inputCategory.value;
    const price = parseFloat(dom.inputPrice.value);

    if (!title || !sku || !category || isNaN(price)) {
      showToast('Please fill in Saree Title, SKU, Category, and a valid Price.', 'error');
      return;
    }

    let finalImageUrl = dom.inputImageUrl.value.trim();

    // Check if a file was selected for upload
    const file = dom.inputFileImage.files && dom.inputFileImage.files[0];
    if (file) {
      try {
        finalImageUrl = await uploadImageToStorage(file);
      } catch (uploadErr) {
        showToast('Image upload failed: ' + uploadErr.message, 'error');
        return;
      }
    }

    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';
    }

    // Parse colors array
    const colors = dom.inputColors.value
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const productPayload = {
      sku,
      title,
      title_te: dom.inputTitleTe.value.trim() || null,
      category,
      fabric: dom.inputFabric.value.trim() || 'Pure Silk',
      colors: colors,
      price: price,
      original_price: dom.inputOriginalPrice.value ? parseFloat(dom.inputOriginalPrice.value) : null,
      stock_quantity: parseInt(dom.inputStockQty.value, 10) || 0,
      stock_status: dom.inputStockStatus.value,
      short_description: dom.inputShortDesc.value.trim() || null,
      description: dom.inputDescription.value.trim() || null,
      blouse_details: dom.inputBlouse.value.trim() || 'Running Blouse 80cm included',
      zari_type: dom.inputZari.value.trim() || 'Tested Gold Zari',
      saree_length: dom.inputLength.value.trim() || '6.3 Meters (with blouse)',
      care_instructions: dom.inputCare.value.trim() || 'Dry Clean Only',
      image_url: finalImageUrl,
      is_featured: dom.checkFeatured.checked,
      is_new_arrival: dom.checkNewArrival.checked,
      is_best_seller: dom.checkBestSeller.checked,
      is_active: dom.checkActive.checked
    };

    if (state.supabaseClient && !state.isDemoMode) {
      try {
        if (state.editingProductId) {
          // Update Supabase
          const { error } = await state.supabaseClient
            .from('products')
            .update(productPayload)
            .or(`id.eq.${state.editingProductId},sku.eq.${state.editingProductId}`);

          if (error) throw error;
          showToast(`Saree "${title}" updated successfully!`, 'success');
        } else {
          // Insert into Supabase
          const { error } = await state.supabaseClient
            .from('products')
            .insert([productPayload]);

          if (error) throw error;
          showToast(`New saree "${title}" added to inventory!`, 'success');
        }
      } catch (err) {
        showToast('Database Error: ' + err.message, 'error');
        return;
      }
    } else {
      // Demo / LocalStorage Mode
      if (state.editingProductId) {
        const idx = state.products.findIndex(p => (p.id && p.id === state.editingProductId) || p.sku === state.editingProductId);
        if (idx > -1) {
          state.products[idx] = { ...state.products[idx], ...productPayload };
          showToast(`Saree "${title}" updated in Demo mode!`, 'success');
        }
      } else {
        const newProd = {
          id: 'demo-' + Date.now(),
          ...productPayload,
          is_demo: true,
          created_at: new Date().toISOString()
        };
        state.products.unshift(newProd);
        showToast(`New saree "${title}" created in Demo mode!`, 'success');
      }
      saveDemoProducts();
    }

    closeProductModal();
    loadProducts();
  }

  // ===================================================================
  // 6. QUICK TOGGLES & DELETE
  // ===================================================================
  async function quickToggleVisibility(identifier) {
    const product = state.products.find(p => (p.id && p.id === identifier) || p.sku === identifier);
    if (!product) return;

    const newVisibility = !product.is_active;

    if (state.supabaseClient && !state.isDemoMode) {
      try {
        const { error } = await state.supabaseClient
          .from('products')
          .update({ is_active: newVisibility })
          .or(`id.eq.${identifier},sku.eq.${identifier}`);

        if (error) throw error;
        product.is_active = newVisibility;
        showToast(`Saree visibility set to ${newVisibility ? 'Visible' : 'Hidden'}`, 'success');
      } catch (err) {
        showToast('Could not update visibility: ' + err.message, 'error');
        return;
      }
    } else {
      product.is_active = newVisibility;
      saveDemoProducts();
      showToast(`Saree visibility set to ${newVisibility ? 'Visible' : 'Hidden'} (Demo)`, 'info');
    }

    applyTableFilters();
    updateDashboardStats();
  }

  async function quickUpdateStock(identifier, newStatus) {
    const product = state.products.find(p => (p.id && p.id === identifier) || p.sku === identifier);
    if (!product) return;

    const newQty = newStatus === 'out_of_stock' ? 0 : (product.stock_quantity > 0 ? product.stock_quantity : 5);

    if (state.supabaseClient && !state.isDemoMode) {
      try {
        const { error } = await state.supabaseClient
          .from('products')
          .update({ stock_status: newStatus, stock_quantity: newQty })
          .or(`id.eq.${identifier},sku.eq.${identifier}`);

        if (error) throw error;
        product.stock_status = newStatus;
        product.stock_quantity = newQty;
        showToast(`Stock status updated to "${newStatus}"`, 'success');
      } catch (err) {
        showToast('Could not update stock status: ' + err.message, 'error');
        return;
      }
    } else {
      product.stock_status = newStatus;
      product.stock_quantity = newQty;
      saveDemoProducts();
      showToast(`Stock status updated to "${newStatus}" (Demo)`, 'info');
    }

    applyTableFilters();
    updateDashboardStats();
  }

  function openDeleteConfirm(identifier) {
    const product = state.products.find(p => (p.id && p.id === identifier) || p.sku === identifier);
    if (!product) return;

    pendingDeleteId = identifier;
    if (dom.deleteItemName) {
      dom.deleteItemName.textContent = `"${product.title}" (${product.sku})`;
    }
    dom.deleteModal.classList.add('open');
  }

  function closeDeleteModal() {
    dom.deleteModal.classList.remove('open');
    pendingDeleteId = null;
  }

  async function confirmDeleteProduct() {
    if (!pendingDeleteId) return;

    if (state.supabaseClient && !state.isDemoMode) {
      try {
        const { error } = await state.supabaseClient
          .from('products')
          .delete()
          .or(`id.eq.${pendingDeleteId},sku.eq.${pendingDeleteId}`);

        if (error) throw error;
        showToast('Saree deleted from database', 'info');
      } catch (err) {
        showToast('Delete error: ' + err.message, 'error');
        return;
      }
    } else {
      state.products = state.products.filter(p => (p.id && p.id !== pendingDeleteId) && p.sku !== pendingDeleteId);
      saveDemoProducts();
      showToast('Saree deleted from demo inventory', 'info');
    }

    closeDeleteModal();
    loadProducts();
  }

  // ===================================================================
  // 7. SEED INITIAL DEMO CATALOGUE INTO SUPABASE
  // ===================================================================
  async function seedDemoDataToSupabase() {
    if (!state.supabaseClient || state.isDemoMode) {
      showToast('Connect real Supabase first to seed data.', 'error');
      return;
    }

    if (!confirm('This will insert 12 curated traditional sarees into your Supabase products table. Proceed?')) {
      return;
    }

    showToast('Seeding sample sarees into Supabase...', 'info');
    const demoItems = window.DEMO_PRODUCTS || [];

    const rowsToInsert = demoItems.map(item => ({
      sku: item.sku,
      title: item.title,
      title_te: item.title_te,
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

    try {
      const { error } = await state.supabaseClient
        .from('products')
        .upsert(rowsToInsert, { onConflict: 'sku' });

      if (error) throw error;
      showToast('Successfully seeded 12 sarees into Supabase!', 'success');
      loadProducts();
    } catch (e) {
      showToast('Seeding failed: ' + e.message, 'error');
    }
  }

  // ===================================================================
  // 8. EVENT LISTENERS WIRING
  // ===================================================================
  function setupEventListeners() {
    if (dom.loginForm) dom.loginForm.addEventListener('submit', handleLogin);
    if (dom.btnDemoLogin) dom.btnDemoLogin.addEventListener('click', enterDemoMode);
    if (dom.btnLogout) dom.btnLogout.addEventListener('click', handleLogout);

    // Search & Filters
    let searchTimeout;
    if (dom.adminSearchInput) {
      dom.adminSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          state.searchQuery = e.target.value;
          applyTableFilters();
        }, 200);
      });
    }

    if (dom.adminCategorySelect) {
      dom.adminCategorySelect.addEventListener('change', (e) => {
        state.categoryFilter = e.target.value;
        applyTableFilters();
      });
    }

    if (dom.adminStockSelect) {
      dom.adminStockSelect.addEventListener('change', (e) => {
        state.stockFilter = e.target.value;
        applyTableFilters();
      });
    }

    if (dom.adminVisibilitySelect) {
      dom.adminVisibilitySelect.addEventListener('change', (e) => {
        state.visibilityFilter = e.target.value;
        applyTableFilters();
      });
    }

    // Modal triggers
    if (dom.btnOpenAddModal) dom.btnOpenAddModal.addEventListener('click', openAddModal);
    if (dom.btnCloseProductModal) dom.btnCloseProductModal.addEventListener('click', closeProductModal);
    if (dom.btnCancelProductModal) dom.btnCancelProductModal.addEventListener('click', closeProductModal);
    if (dom.productForm) dom.productForm.addEventListener('submit', handleProductFormSubmit);

    // Image URL preview update
    if (dom.inputImageUrl) {
      dom.inputImageUrl.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url && dom.imagePreviewBox) {
          dom.imagePreviewBox.innerHTML = `<img src="${escapeHtml(url)}" alt="Preview" onerror="this.src=''; this.alt='Invalid URL';" />`;
        }
      });
    }

    // File input preview
    if (dom.inputFileImage) {
      dom.inputFileImage.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file && dom.imagePreviewBox) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            dom.imagePreviewBox.innerHTML = `<img src="${ev.target.result}" alt="Preview" />`;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Delete Modal
    if (dom.btnConfirmDelete) dom.btnConfirmDelete.addEventListener('click', confirmDeleteProduct);
    if (dom.btnCancelDelete) dom.btnCancelDelete.addEventListener('click', closeDeleteModal);

    // Seed Demo Data trigger
    if (dom.btnSeedDemoData) dom.btnSeedDemoData.addEventListener('click', seedDemoDataToSupabase);
  }

  // ===================================================================
  // 9. HELPERS
  // ===================================================================
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
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Expose API for inline button handlers
  window.sreeAdmin = {
    openEditModal,
    openDeleteConfirm,
    quickToggleVisibility,
    quickUpdateStock,
    showToast
  };

  document.addEventListener('DOMContentLoaded', initAdmin);

})();
