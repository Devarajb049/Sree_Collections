import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Eye, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SHOP_CONFIG } from '../lib/supabase';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const title = product.name || product.title;
  const sku = product.sku || '';
  const price = Number(product.price);
  const originalPrice = product.original_price ? Number(product.original_price) : null;
  const isOutOfStock = product.stock_status === 'out_of_stock' || (product.stock_quantity !== undefined && product.stock_quantity <= 0);
  const isLowStock = product.stock_status === 'low_stock' || (product.stock_quantity > 0 && product.stock_quantity <= 3);

  // Discount percentage
  let discountPercent = 0;
  if (originalPrice && originalPrice > price) {
    discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  // Fallback image
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
  };

  const productUrl = `/product/${product.slug || product.id || product.sku}`;

  // Direct single-product WhatsApp order
  const handleDirectWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const baseUrl = window.location.origin;
    let msg = `*NAMASTE ${SHOP_CONFIG.name.toUpperCase()}!*\n`;
    msg += `I am interested in this saree from your catalogue:\n\n`;
    msg += `*SAREE DETAILS:*\n`;
    msg += `• Name: *${title}*\n`;
    msg += `• Product Code: ${sku}\n`;
    msg += `• Price: ₹${price.toLocaleString('en-IN')}\n`;
    msg += `• Fabric: ${product.fabric || 'Pure Silk'}\n`;
    msg += `• Web Link: ${baseUrl}${productUrl}\n`;
    if (product.image_url) {
      msg += `• Image: ${product.image_url}\n`;
    }
    msg += `\nIs this saree available for dispatch? Can you please share a video preview on WhatsApp? Thank you!`;

    const encoded = encodeURIComponent(msg);
    const cleanNumber = SHOP_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <article className="product-card" data-sku={sku}>
      <Link to={productUrl} className="product-image-container" aria-label={`View details of ${title}`}>
        <img
          src={product.image_url}
          alt={title}
          loading="lazy"
          onError={handleImageError}
        />

        {/* Top Badges */}
        <div className="product-badges-top">
          {product.is_demo && <span className="badge badge-demo" title="Sample inventory item">Demo Saree</span>}
          {product.is_featured && <span className="badge badge-featured">Featured</span>}
          {product.is_new_arrival && <span className="badge badge-new">New Arrival</span>}
          {discountPercent > 0 && <span className="badge badge-discount">{discountPercent}% OFF</span>}
        </div>

        {/* Stock Badge */}
        <div className="badge-stock">
          {isOutOfStock ? (
            <span className="badge badge-out-of-stock">Sold Out</span>
          ) : isLowStock ? (
            <span className="badge badge-low-stock">Few Left</span>
          ) : (
            <span className="badge badge-in-stock">In Stock</span>
          )}
        </div>

        {/* Quick View Button Hover Overlay */}
        <div className="quick-view-overlay-btn">
          <Eye size={14} />
          <span>View Details</span>
        </div>
      </Link>

      <div className="product-content">
        <div className="product-meta-sub">
          <span>{product.category}</span>
          <span className="product-sku">{sku}</span>
        </div>

        <h3 className="product-title">
          <Link to={productUrl}>{title}</Link>
        </h3>

        <div className="product-fabric-tag">
          <Sparkles size={13} className="text-gold" />
          <span>{product.fabric || 'Pure Handloom Silk'}</span>
        </div>

        {/* Colors */}
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className="product-colors-list">
            {product.colors.slice(0, 3).map((c, idx) => (
              <span key={idx} className="color-dot">{c}</span>
            ))}
          </div>
        )}

        {/* Price Row */}
        <div className="product-price-box">
          <span className="price-current">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
          {discountPercent > 0 && (
            <span className="price-discount-tag">{discountPercent}% off</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-card-actions">
          <button
            type="button"
            className="btn-add-cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${title} to Cart`}
          >
            <ShoppingBag size={16} />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>

          <button
            type="button"
            className="btn-direct-whatsapp"
            onClick={handleDirectWhatsApp}
            title="Enquire on WhatsApp"
            aria-label="Order on WhatsApp"
          >
            <MessageSquare size={17} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
