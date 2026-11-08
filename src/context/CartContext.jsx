import React, { createContext, useContext, useState, useEffect } from 'react';
import { SHOP_CONFIG } from '../lib/supabase';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'sree_cart_v2';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  // Add item with stock limit checking
  const addToCart = (product, quantity = 1) => {
    if (!product) return;

    if (product.stock_status === 'out_of_stock' || (product.stock_quantity !== undefined && product.stock_quantity <= 0)) {
      alert('Sorry, this saree is currently out of stock!');
      return false;
    }

    setCart(prevCart => {
      const existingIdx = prevCart.findIndex(item => item.id === product.id || item.sku === product.sku);
      const maxStock = product.stock_quantity !== undefined ? product.stock_quantity : 99;

      if (existingIdx > -1) {
        const currentQty = prevCart[existingIdx].quantity;
        const newQty = Math.min(currentQty + quantity, maxStock);
        
        if (currentQty >= maxStock) {
          alert(`Only ${maxStock} pieces available in stock for this saree.`);
          return prevCart;
        }

        const updated = [...prevCart];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty
        };
        return updated;
      } else {
        const itemToAdd = {
          id: product.id || product.sku,
          sku: product.sku,
          name: product.name || product.title,
          slug: product.slug,
          price: Number(product.price),
          original_price: product.original_price ? Number(product.original_price) : null,
          image_url: product.image_url,
          fabric: product.fabric || 'Pure Silk',
          color: product.color || (Array.isArray(product.colors) ? product.colors[0] : ''),
          quantity: Math.min(quantity, maxStock),
          stock_quantity: maxStock
        };
        return [...prevCart, itemToAdd];
      }
    });

    setIsCartOpen(true);
    return true;
  };

  // Update item quantity safely
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === id || item.sku === id) {
          const maxStock = item.stock_quantity !== undefined ? item.stock_quantity : 99;
          if (newQuantity > maxStock) {
            alert(`Maximum available stock is ${maxStock}.`);
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Remove item
  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id && item.sku !== id));
  };

  // Clear all items
  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isFreeShipping = subtotal >= SHOP_CONFIG.freeShippingThreshold;
  const shippingFee = cart.length === 0 ? 0 : (isFreeShipping ? 0 : 150);
  const total = subtotal + shippingFee;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * Generates a formatted WhatsApp message and click-to-chat URL
   */
  const generateWhatsAppCheckoutUrl = (customerDetails = {}) => {
    if (cart.length === 0) return null;

    const {
      name = '',
      phone = '',
      city = '',
      notes = ''
    } = customerDetails;

    const baseUrl = window.location.origin;

    let msg = `*NAMASTE ${SHOP_CONFIG.name.toUpperCase()}!*\n`;
    msg += `I would like to place an order from your website catalogue:\n\n`;

    if (name || city || phone) {
      msg += `*CUSTOMER DETAILS:*\n`;
      if (name) msg += `• Name: ${name}\n`;
      if (phone) msg += `• Phone: ${phone}\n`;
      if (city) msg += `• Delivery City/Pincode: ${city}\n`;
      if (notes) msg += `• Special Notes: ${notes}\n`;
      msg += `\n`;
    }

    msg += `*ORDERED SAREES (${cart.length} item${cart.length > 1 ? 's' : ''}):*\n`;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      msg += `----------------------------------------\n`;
      msg += `${index + 1}. *${item.name}*\n`;
      msg += `   • Code: ${item.sku}\n`;
      msg += `   • Fabric: ${item.fabric}\n`;
      if (item.color) msg += `   • Color: ${item.color}\n`;
      msg += `   • Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${itemTotal.toLocaleString('en-IN')}\n`;
      msg += `   • Saree Link: ${baseUrl}/product/${item.slug || item.sku}\n`;
      if (item.image_url) {
        msg += `   • Photo: ${item.image_url}\n`;
      }
    });

    msg += `----------------------------------------\n`;
    msg += `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    msg += `*Shipping:* ${isFreeShipping ? 'FREE Express Delivery' : '₹150'}\n`;
    msg += `*ESTIMATED TOTAL: ₹${total.toLocaleString('en-IN')}*\n`;
    msg += `----------------------------------------\n\n`;
    msg += `Please confirm stock availability and share payment options (UPI/GPay/PhonePe/Bank Transfer). Thank you!`;

    const encodedMsg = encodeURIComponent(msg);
    const cleanNumber = SHOP_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        isFreeShipping,
        shippingFee,
        total,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        generateWhatsAppCheckoutUrl
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
