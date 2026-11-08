import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, CheckCircle, AlertTriangle, Tag, Plus, Edit, Trash2,
  ExternalLink, LogOut, Search, Filter, Upload, Image, RefreshCw, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminProducts, createProduct, updateProduct, deleteProduct,
  toggleProductActive, updateProductStock, seedDemoProductsToSupabase
} from '../services/productService';
import { CATEGORIES } from '../data/demoProducts';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const { user, isDemoAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Kanchipuram Silk Sarees',
    fabric: 'Pure Mulberry Silk',
    colors: '',
    price: '',
    original_price: '',
    stock_quantity: 5,
    stock_status: 'in_stock',
    short_description: '',
    description: '',
    blouse_details: 'Running Blouse 80cm included',
    zari_type: 'Pure Tested Gold Zari',
    saree_length: '6.3 Meters (including blouse)',
    care_instructions: 'Dry Clean Only',
    image_url: '',
    is_featured: false,
    is_new_arrival: false,
    is_best_seller: false,
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const { products: list, isLive: live } = await getAdminProducts();
      setProducts(list);
      setIsLive(live);
    } catch (err) {
      showToast('Error loading products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // Open modal for new saree
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      sku: `SRC-${products.length + 101}`,
      name: '',
      category: 'Kanchipuram Silk Sarees',
      fabric: 'Pure Mulberry Silk',
      colors: '',
      price: '',
      original_price: '',
      stock_quantity: 5,
      stock_status: 'in_stock',
      short_description: '',
      description: '',
      blouse_details: 'Running Blouse 80cm included',
      zari_type: 'Pure Tested Gold Zari',
      saree_length: '6.3 Meters (including blouse)',
      care_instructions: 'Dry Clean Only',
      image_url: '',
      is_featured: false,
      is_new_arrival: false,
      is_best_seller: false,
      is_active: true
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  // Open modal for editing existing saree
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku || '',
      name: item.name || item.title || '',
      category: item.category || 'Kanchipuram Silk Sarees',
      fabric: item.fabric || '',
      colors: Array.isArray(item.colors) ? item.colors.join(', ') : (item.color || ''),
      price: item.price || '',
      original_price: item.original_price || '',
      stock_quantity: item.stock_quantity ?? 5,
      stock_status: item.stock_status || 'in_stock',
      short_description: item.short_description || '',
      description: item.description || '',
      blouse_details: item.blouse_details || '',
      zari_type: item.zari_type || '',
      saree_length: item.saree_length || '6.3 Meters (including blouse)',
      care_instructions: item.care_instructions || 'Dry Clean Only',
      image_url: item.image_url || '',
      is_featured: Boolean(item.is_featured),
      is_new_arrival: Boolean(item.is_new_arrival),
      is_best_seller: Boolean(item.is_best_seller),
      is_active: item.is_active !== false
    });
    setImageFile(null);
    setImagePreview(item.image_url || '');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price) {
      alert('Please fill in Saree Name, SKU Code, and Price.');
      return;
    }

    try {
      setSubmitting(true);
      const colorsArray = formData.colors
        ? formData.colors.split(',').map(c => c.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
        colors: colorsArray
      };

      if (editingItem) {
        await updateProduct(editingItem.id || editingItem.sku, payload, imageFile);
        showToast(`Saree "${formData.name}" updated successfully!`);
      } else {
        await createProduct(payload, imageFile);
        showToast(`New saree "${formData.name}" added to inventory!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Save Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteProduct(deleteCandidate.id || deleteCandidate.sku);
      showToast('Saree deleted from catalogue.');
      setDeleteCandidate(null);
      loadData();
    } catch (err) {
      alert('Delete Error: ' + err.message);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const nextStatus = !item.is_active;
      await toggleProductActive(item.id || item.sku, nextStatus);
      showToast(`Saree visibility set to ${nextStatus ? 'Visible' : 'Hidden'}`);
      loadData();
    } catch (err) {
      showToast('Update failed: ' + err.message);
    }
  };

  const handleStockChange = async (item, newStock) => {
    try {
      const qty = newStock === 'out_of_stock' ? 0 : (item.stock_quantity > 0 ? item.stock_quantity : 5);
      await updateProductStock(item.id || item.sku, newStock, qty);
      showToast(`Stock status updated to "${newStock}"`);
      loadData();
    } catch (err) {
      showToast('Stock update failed: ' + err.message);
    }
  };

  const handleSeedDemoData = async () => {
    if (!window.confirm('This will insert 12 curated traditional sarees into your Supabase products table. Proceed?')) return;
    try {
      await seedDemoProductsToSupabase();
      showToast('Successfully seeded 12 sarees into Supabase!');
      loadData();
    } catch (err) {
      alert('Seeding error: ' + err.message);
    }
  };

  // Filter products for table display
  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase().trim();
    const title = (p.name || p.title || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const fabric = (p.fabric || '').toLowerCase();
    const matchesSearch = !q || title.includes(q) || sku.includes(q) || fabric.includes(q);

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || p.stock_status === stockFilter;
    const matchesVisibility = visibilityFilter === 'all' ||
      (visibilityFilter === 'active' && p.is_active) ||
      (visibilityFilter === 'hidden' && !p.is_active);

    return matchesSearch && matchesCategory && matchesStock && matchesVisibility;
  });

  // Calculate Overview Stats
  const totalCount = products.length;
  const activeCount = products.filter(p => p.is_active).length;
  const alertCount = products.filter(p => p.stock_status === 'out_of_stock' || p.stock_status === 'low_stock' || (p.stock_quantity !== undefined && p.stock_quantity <= 2)).length;
  const uniqueCategories = new Set(products.map(p => p.category)).size;

  return (
    <div className="admin-shell">
      {/* Admin Topbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <img src="/assets/icons/logo.svg" alt="Sree Collections" />
          <div>
            <h1>SREE COLLECTIONS</h1>
            <div style={{ fontSize: '0.72rem', color: '#fce082' }}>Showroom Management Portal</div>
          </div>
        </div>

        <div className="admin-user-info">
          <Link to="/" target="_blank" className="btn-admin-secondary" style={{ color: '#fff', background: 'rgba(255,255,255,0.12)', fontSize: '0.78rem', padding: '4px 10px' }}>
            <ExternalLink size={14} />
            <span>Storefront</span>
          </Link>
          <span className="admin-email-tag">
            {isDemoAdmin ? 'Demo Admin (LocalStorage)' : (user?.name || user?.username || user?.email || 'Admin')}
          </span>
          <button type="button" onClick={handleLogout} className="btn-admin-logout">
            <LogOut size={13} style={{ marginRight: '4px' }} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="admin-main">
        {/* Toast Alert */}
        {toastMessage && (
          <div style={{ background: '#3b0612', color: '#fff', borderLeft: '4px solid #d4af37', padding: '0.85rem 1.25rem', borderRadius: '6px', marginBottom: '1.25rem', boxShadow: 'var(--shadow-md)' }}>
            {toastMessage}
          </div>
        )}

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-left">
              <strong>{totalCount}</strong>
              <span>Total Sarees in Inventory</span>
            </div>
            <div className="stat-icon"><Package size={22} /></div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-left">
              <strong>{activeCount}</strong>
              <span>Active on Website</span>
            </div>
            <div className="stat-icon" style={{ color: '#15803d' }}><CheckCircle size={22} /></div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-left">
              <strong style={{ color: '#b91c1c' }}>{alertCount}</strong>
              <span>Low Stock / Sold Out</span>
            </div>
            <div className="stat-icon" style={{ color: '#b91c1c' }}><AlertTriangle size={22} /></div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-left">
              <strong>{uniqueCategories}</strong>
              <span>Distinct Categories</span>
            </div>
            <div className="stat-icon"><Tag size={22} /></div>
          </div>
        </div>

        {/* Table Management Container */}
        <div className="admin-table-container">
          <div className="table-toolbar">
            <div className="toolbar-search-filters">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: '#888' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, SKU, or fabric..."
                  className="admin-search-input"
                  style={{ paddingLeft: '2rem' }}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-filter-select"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.category}>{c.name}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="admin-filter-select"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Sold Out</option>
              </select>

              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="admin-filter-select"
              >
                <option value="all">All Visibility</option>
                <option value="active">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div className="toolbar-actions">
              {isLive && (
                <button
                  type="button"
                  onClick={handleSeedDemoData}
                  className="btn-admin-secondary"
                  title="Populate Supabase with 12 curated sarees"
                >
                  <RefreshCw size={14} />
                  <span>Seed 12 Sarees</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="btn-admin-primary"
              >
                <Plus size={16} />
                <span>Add New Saree</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="data-table-wrapper">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <LoadingSpinner text="Fetching inventory..." />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No sarees found matching your filter criteria.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Photo</th>
                    <th>Saree Title &amp; SKU</th>
                    <th>Category &amp; Fabric</th>
                    <th>Price (INR)</th>
                    <th>Stock Availability</th>
                    <th>Catalog Visibility</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const isOut = p.stock_status === 'out_of_stock';
                    const isLow = p.stock_status === 'low_stock';
                    const title = p.name || p.title;

                    return (
                      <tr key={p.id || p.sku}>
                        <td>
                          <img
                            src={p.image_url}
                            alt={title}
                            className="table-img-thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                        </td>
                        <td className="table-title-cell">
                          <strong>{title}</strong>
                          <span>SKU: {p.sku}</span>
                        </td>
                        <td>
                          <div>{p.category}</div>
                          <small style={{ color: '#6e645e' }}>{p.fabric || 'Pure Silk'}</small>
                        </td>
                        <td>
                          <strong>₹{Number(p.price).toLocaleString('en-IN')}</strong>
                          {p.original_price && (
                            <div>
                              <small style={{ textDecoration: 'line-through', color: '#888' }}>
                                ₹{Number(p.original_price).toLocaleString('en-IN')}
                              </small>
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ marginBottom: '4px' }}>
                            {isOut ? (
                              <span className="table-badge table-badge-soldout">Sold Out (0)</span>
                            ) : isLow ? (
                              <span className="table-badge table-badge-lowstock">Low Stock ({p.stock_quantity ?? 1})</span>
                            ) : (
                              <span className="table-badge table-badge-instock">In Stock ({p.stock_quantity ?? 5})</span>
                            )}
                          </div>
                          <select
                            value={p.stock_status || 'in_stock'}
                            onChange={(e) => handleStockChange(p, e.target.value)}
                            style={{ fontSize: '0.75rem', padding: '2px 4px', border: '1px solid #d0c4b4', borderRadius: '4px' }}
                          >
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Mark Sold Out</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ marginBottom: '4px' }}>
                            {p.is_active ? (
                              <span className="table-badge table-badge-active">Visible</span>
                            ) : (
                              <span className="table-badge table-badge-hidden">Hidden</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            className="btn-table-action"
                            style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                          >
                            {p.is_active ? 'Hide Saree' : 'Publish Saree'}
                          </button>
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              className="btn-table-action"
                              title="Edit Saree"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(p)}
                              className="btn-table-action btn-table-delete"
                              title="Delete Saree"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Saree Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay open">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingItem ? `Edit Saree: ${editingItem.name || editingItem.title}` : 'Add New Saree to Showroom'}</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-admin-secondary"
                style={{ padding: '4px 8px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Product SKU Code *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. SRC-113"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select"
                    required
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.category}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Saree Name / Title *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Maroon Kanchipuram Pure Silk Saree"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-grid-3" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="18499"
                    className="form-input"
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original / MRP Price (₹)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="23999"
                    className="form-input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-grid-3" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Fabric Type</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="Pure Mulberry Silk"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Colors (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Maroon, Royal Gold"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Status</label>
                  <select
                    value={formData.stock_status}
                    onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                    className="form-select"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock (Few Left)</option>
                    <option value="out_of_stock">Out of Stock (Sold Out)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Short Summary Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="1-2 sentences highlighting border and pallu"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Detailed Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Weave details, occasion recommendation, border motifs, history..."
                  className="form-textarea"
                />
              </div>

              <div className="form-grid-2" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Blouse Piece Details</label>
                  <input
                    type="text"
                    value={formData.blouse_details}
                    onChange={(e) => setFormData({ ...formData, blouse_details: e.target.value })}
                    placeholder="Contrast Brocade Blouse (80 cm unstitched)"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Zari Type</label>
                  <input
                    type="text"
                    value={formData.zari_type}
                    onChange={(e) => setFormData({ ...formData, zari_type: e.target.value })}
                    placeholder="Pure Tested Gold Zari"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Saree Image Upload or URL */}
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#faf6ee', border: '1px solid var(--admin-border)', borderRadius: '8px' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Saree Photography (Upload or URL)
                </label>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div className="image-preview-box">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>No Preview</span>
                    )}
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Upload to Supabase Storage</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="form-input"
                        style={{ padding: '0.35rem' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Or Paste Image Web URL</label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => {
                          setFormData({ ...formData, image_url: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visibility and Feature Toggles */}
              <div className="toggles-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Visible to Customers</span>
                </label>

                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>

                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                  />
                  <span>New Arrival</span>
                </label>

                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.is_best_seller}
                    onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-admin-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-admin-primary"
                >
                  <span>{submitting ? 'Saving...' : 'Save Saree'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="admin-modal-overlay open">
          <div className="admin-modal" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗑️</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#b91c1c', marginBottom: '0.5rem' }}>
              Delete Saree?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently remove <strong>{deleteCandidate.name || deleteCandidate.title}</strong> ({deleteCandidate.sku})?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="btn-admin-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn-admin-primary"
                style={{ background: '#b91c1c' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

