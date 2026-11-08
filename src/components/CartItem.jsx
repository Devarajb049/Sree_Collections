import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  if (!item) return null;

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-img">
        <img
          src={item.image_url}
          alt={item.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80';
          }}
        />
      </div>

      <div className="cart-item-info">
        <h4 className="cart-item-title">{item.name}</h4>
        <span className="cart-item-fabric">
          {item.fabric} &bull; Code: {item.sku}
        </span>
        <span className="cart-item-price">
          ₹{item.price.toLocaleString('en-IN')}
        </span>

        <div className="cart-qty-controls">
          <button
            type="button"
            className="qty-btn"
            onClick={handleDecrement}
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <span className="qty-display">{item.quantity}</span>
          <button
            type="button"
            className="qty-btn"
            onClick={handleIncrement}
            disabled={item.stock_quantity !== undefined && item.quantity >= item.stock_quantity}
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="cart-item-actions-col">
        <span className="cart-item-subtotal">₹{itemTotal.toLocaleString('en-IN')}</span>
        <button
          type="button"
          className="cart-remove-item-btn"
          onClick={handleRemove}
          title="Remove from Cart"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;

