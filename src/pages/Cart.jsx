import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, MessageSquare, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { SHOP_CONFIG } from '../lib/supabase';

const Cart = () => {
  const {
    cart,
    subtotal,
    isFreeShipping,
    shippingFee,
    total,
    totalItems,
    clearCart,
    generateWhatsAppCheckoutUrl
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const threshold = SHOP_CONFIG.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, threshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));

  const handleWhatsAppCheckout = () => {
    const url = generateWhatsAppCheckoutUrl({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      city: customerCity.trim(),
      notes: customerNotes.trim()
    });

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page" style={{ padding: '4rem 0 6rem 0' }}>
        <div className="container">
          <div className="cart-empty-view" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
            <ShoppingBag size={64} className="text-gold" style={{ margin: '0 auto 1.25rem auto' }} />
            <h2 style={{ fontFamily: 'var(--font-royal)', color: 'var(--color-maroon-primary)', marginBottom: '0.75rem' }}>
              Your Saree Cart is Empty
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              You haven't selected any sarees yet. Explore our handcrafted Kanchipuram, Banarasi, and handloom cotton sarees!
            </p>
            <Link to="/collections" className="btn-primary-gold">
              Explore Saree Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Breadcrumb Back */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-maroon-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <span className="section-subtitle">Shopping Bag</span>
          <h1 className="section-title">Your Selected Sarees ({totalItems})</h1>
          <div className="gold-divider" style={{ margin: '0.75rem 0 0 0' }}><span>◆</span></div>
        </div>

        <div className="cart-layout-grid">
          {/* Left Column: Cart Items */}
          <div className="cart-items-column">
            {/* Free Shipping Alert Box */}
            <div className="free-shipping-progress-box" style={{ borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#634305' }}>
                  {isFreeShipping
                    ? '🎉 You have unlocked FREE Insured Express Shipping across India!'
                    : `Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} more to get FREE Express Delivery!`}
                </span>
                <Truck size={18} className="text-gold" />
              </div>
              <div className="free-shipping-bar">
                <div className="free-shipping-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="cart-items-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-ivory-border)', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--color-maroon-primary)' }}>Saree Details</span>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--color-danger)' }}
                >
                  <Trash2 size={14} />
                  <span>Clear Entire Cart</span>
                </button>
              </div>

              <div className="cart-items-list-wrapper">
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & WhatsApp Checkout */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h3 style={{ fontFamily: 'var(--font-royal)', color: 'var(--color-maroon-primary)', fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--color-ivory-border)' }}>
                Order Summary
              </h3>

              <div className="cart-summary-line">
                <span>Subtotal ({totalItems} items):</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="cart-summary-line">
                <span>Insured Courier Delivery:</span>
                <span style={{ color: isFreeShipping ? 'var(--color-success)' : 'inherit', fontWeight: isFreeShipping ? '700' : 'normal' }}>
                  {isFreeShipping ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              <div className="cart-summary-line total-line">
                <span>Estimated Total:</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              {/* Customer Details Form */}
              <div className="cart-checkout-form" style={{ marginTop: '1.25rem' }}>
                <legend>Customer &amp; Delivery Details (Optional):</legend>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Full Name (e.g. Smt. Lakshmi)"
                  className="cart-input"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Your WhatsApp / Contact Number"
                  className="cart-input"
                />
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Delivery City &amp; Pincode (e.g. Hyderabad - 500081)"
                  className="cart-input"
                />
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Special requests / blouse stitching inquiries..."
                  className="cart-input"
                  rows={2}
                />
              </div>

              {/* WhatsApp Checkout Button */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="btn-whatsapp-checkout"
                style={{ width: '100%', marginTop: '1.25rem' }}
              >
                <MessageSquare size={20} />
                <span>Proceed to WhatsApp Checkout</span>
              </button>

              <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#6e645e', textAlign: 'center', lineHeight: 1.5 }}>
                <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#15803d' }} />
                Orders are verified by our showroom team on WhatsApp before payment. UPI, Card &amp; NetBanking accepted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
