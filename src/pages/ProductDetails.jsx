import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageSquare, ArrowLeft, ShieldCheck, Video, Sparkles, Check, Truck } from 'lucide-react';
import { getProductById, getProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { SHOP_CONFIG } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductGrid from '../components/ProductGrid';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getProductById(id);
        if (isMounted) {
          if (!data) {
            setProduct(null);
          } else {
            setProduct(data);
            setSelectedImage(data.image_url);
            setQuantity(1);

            // Load related products from the same category
            const { products: all } = await getProducts({ category: data.category });
            if (isMounted) {
              setRelatedProducts(all.filter(p => (p.id !== data.id && p.sku !== data.sku)).slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Retrieving Saree Details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-royal)', color: 'var(--color-maroon-primary)', marginBottom: '1rem' }}>
          Saree Not Found
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          The requested saree could not be found or may have been archived.
        </p>
        <Link to="/collections" className="btn-primary-gold">
          Browse All Sarees
        </Link>
      </div>
    );
  }

  const title = product.name || product.title;
  const sku = product.sku || '';
  const price = Number(product.price);
  const originalPrice = product.original_price ? Number(product.original_price) : null;
  const isOutOfStock = product.stock_status === 'out_of_stock' || (product.stock_quantity !== undefined && product.stock_quantity <= 0);
  const maxStock = product.stock_quantity !== undefined ? product.stock_quantity : 10;

  let discountPercent = 0;
  if (originalPrice && originalPrice > price) {
    discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleWhatsAppOrder = () => {
    const baseUrl = window.location.origin;
    let msg = `*NAMASTE ${SHOP_CONFIG.name.toUpperCase()}!*\n`;
    msg += `I would like to order this saree from your website:\n\n`;
    msg += `*SAREE DETAILS:*\n`;
    msg += `• Name: *${title}*\n`;
    msg += `• Code: ${sku}\n`;
    msg += `• Fabric: ${product.fabric || 'Pure Silk'}\n`;
    msg += `• Quantity: ${quantity}\n`;
    msg += `• Price: ₹${(price * quantity).toLocaleString('en-IN')}\n`;
    msg += `• Product Page: ${baseUrl}/product/${product.slug || product.id || sku}\n`;
    if (product.image_url) {
      msg += `• Photo: ${product.image_url}\n`;
    }
    msg += `\nPlease confirm availability and share payment options. Thank you!`;

    const cleanNum = SHOP_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? [product.image_url, ...product.images.filter(img => img !== product.image_url)]
    : [product.image_url];

  return (
    <div className="product-details-page" style={{ padding: '2rem 0 5rem 0' }}>
      <div className="container">
        {/* Breadcrumb Back */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-maroon-primary)', fontWeight: '600', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Previous Page</span>
          </button>
        </div>

        {/* Product Layout Grid */}
        <div className="product-details-grid">
          {/* Left Column: Image Gallery */}
          <div className="product-gallery-col">
            <div className="product-main-view-frame">
              <img
                src={selectedImage || product.image_url}
                alt={title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';
                }}
              />
            </div>

            {imagesList.length > 1 && (
              <div className="product-thumbnails-strip">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {product.is_demo && (
              <div style={{ marginTop: '1rem', background: '#fff9e6', border: '1px solid #fae8b4', padding: '0.65rem 1rem', borderRadius: '6px', fontSize: '0.8rem', color: '#8e6510', textAlign: 'center' }}>
                ✨ Sree Collections Showroom Demo Sample • Handcrafted Pure Silk
              </div>
            )}
          </div>

          {/* Right Column: Saree Info & Actions */}
          <div className="product-info-col">
            <div className="product-meta-sub" style={{ fontSize: '0.85rem' }}>
              <span>{product.category}</span>
              <span>SKU: {sku}</span>
            </div>

            <h1 className="details-title">{title}</h1>

            {/* Price Box */}
            <div className="details-price-box">
              <span className="details-price-current">₹{price.toLocaleString('en-IN')}</span>
              {originalPrice && (
                <span className="details-price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
              )}
              {discountPercent > 0 && (
                <span className="badge badge-discount" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Stock Availability */}
            <div style={{ marginBottom: '1.25rem' }}>
              {isOutOfStock ? (
                <span className="badge badge-out-of-stock" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                  Sold Out / Currently Unavailable
                </span>
              ) : (
                <span className="badge badge-in-stock" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                  In Stock ({maxStock} Available)
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="details-description">
              {product.description || product.short_description || 'Authentic traditional handloom saree crafted with certified natural silk and rich border detailing.'}
            </p>

            {/* Specifications Table */}
            <table className="modal-specs-table" style={{ margin: '1.5rem 0' }}>
              <tbody>
                <tr>
                  <td>Fabric:</td>
                  <td><strong>{product.fabric || 'Pure Silk'}</strong></td>
                </tr>
                <tr>
                  <td>Zari Type:</td>
                  <td>{product.zari_type || 'Tested Gold Zari'}</td>
                </tr>
                <tr>
                  <td>Blouse Details:</td>
                  <td>{product.blouse_details || 'Included with Saree (80 cm)'}</td>
                </tr>
                <tr>
                  <td>Saree Length:</td>
                  <td>{product.saree_length || '6.3 Meters (with blouse)'}</td>
                </tr>
                <tr>
                  <td>Care Instructions:</td>
                  <td>{product.care_instructions || 'Dry Clean Only'}</td>
                </tr>
                {product.color && (
                  <tr>
                    <td>Primary Color:</td>
                    <td>{product.color}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Quantity Selector & Action Buttons */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-maroon-primary)' }}>
                  Quantity:
                </span>
                <div className="cart-qty-controls" style={{ marginTop: 0 }}>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="details-actions-group">
              <button
                type="button"
                className="btn-primary-gold"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{ flex: 1, padding: '0.85rem 1.5rem' }}
              >
                {addedSuccess ? <Check size={18} /> : <ShoppingBag size={18} />}
                <span>{addedSuccess ? 'Added to Cart!' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                className="btn-whatsapp-outline"
                onClick={handleWhatsAppOrder}
                style={{ flex: 1, padding: '0.85rem 1.5rem', background: '#25d366', color: '#fff', border: 'none' }}
              >
                <MessageSquare size={18} />
                <span>Order on WhatsApp</span>
              </button>
            </div>

            {/* Video Call Shopping Box */}
            <div className="details-videocall-banner">
              <Video size={22} className="text-gold" />
              <div>
                <strong>Want to inspect pallu &amp; border on video?</strong>
                <p>Book a 1-on-1 WhatsApp video call session with our saree stylists before ordering!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Sarees Recommendations */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '5rem', borderTop: '1px solid var(--color-ivory-border)', paddingTop: '3rem' }}>
            <div className="section-header">
              <span className="section-subtitle">You May Also Admire</span>
              <h2 className="section-title">Similar Traditional Sarees</h2>
              <div className="gold-divider"><span>◆</span></div>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
