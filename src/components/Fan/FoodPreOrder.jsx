// Food Pre-Order System — browse menu, cart, order tracking
import { useState } from 'react';
import { FOOD_MENU } from '../../data/socialData';
import { useQueryStore } from '../../store/queryStore';
import { ZONE_MAP } from '../../data/stadium';

export default function FoodPreOrder() {
  const { fanLocation } = useQueryStore();
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [orderPlaced, setOrderPlaced] = useState(null);

  const categories = ['All', 'Main', 'Snack', 'Drink', 'Dessert', 'Merchandise'];
  const currentZoneName = ZONE_MAP[fanLocation]?.name || '';

  const filteredMenu = FOOD_MENU.filter(item => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    return true;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.map(c => c.id === itemId ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0));
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const placeOrder = () => {
    setOrderPlaced({ items: [...cart], total: cartTotal, estimatedTime: Math.max(...cart.map(c => c.waitTime)) + 2, orderId: `ORD-${Date.now().toString(36).toUpperCase()}` });
    setCart([]);
  };

  if (orderPlaced) {
    return (
      <div className="food-order-status">
        <div className="order-success-icon">✅</div>
        <h3>Order Placed!</h3>
        <div className="order-id">#{orderPlaced.orderId}</div>
        <div className="order-progress">
          <div className="progress-step active">📝 Confirmed</div>
          <div className="progress-line" />
          <div className="progress-step">👨‍🍳 Preparing</div>
          <div className="progress-line" />
          <div className="progress-step">✅ Ready</div>
        </div>
        <div className="order-eta">Estimated ready in <strong>{orderPlaced.estimatedTime} min</strong></div>
        <div className="order-items-summary">
          {orderPlaced.items.map(item => (
            <div key={item.id} className="order-summary-item">
              <span>{item.emoji} {item.name} ×{item.qty}</span>
              <span>${item.price * item.qty}</span>
            </div>
          ))}
          <div className="order-summary-total">
            <strong>Total</strong>
            <strong>${orderPlaced.total}</strong>
          </div>
        </div>
        <button className="order-new-btn" onClick={() => setOrderPlaced(null)}>Place New Order</button>
      </div>
    );
  }

  return (
    <div className="food-preorder">
      <div className="food-header">
        <span className="section-title">🍔 Order from Your Seat</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Deliver to: {currentZoneName}</span>
      </div>

      {/* Category tabs */}
      <div className="food-categories">
        {categories.map(cat => (
          <button key={cat} className={`food-cat-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="food-menu-grid">
        {filteredMenu.map(item => (
          <div key={item.id} className={`food-item ${item.popular ? 'popular' : ''}`}>
            <div className="food-item-emoji">{item.emoji}</div>
            <div className="food-item-info">
              <div className="food-item-name">{item.name} {item.popular && <span className="popular-badge">🔥</span>}</div>
              <div className="food-item-meta">
                <span className="food-price">${item.price}</span>
                <span className="food-wait">⏱️ ~{item.waitTime}m</span>
              </div>
            </div>
            <button className="food-add-btn" onClick={() => addToCart(item)}>+</button>
          </div>
        ))}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="food-cart">
          <div className="cart-header">
            <span>🛒 Cart ({cartCount} items)</span>
            <span className="cart-total">${cartTotal}</span>
          </div>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <span>{item.emoji} {item.name}</span>
                <div className="cart-qty">
                  <button onClick={() => removeFromCart(item.id)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => addToCart(item)}>+</button>
                </div>
                <span>${item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <button className="cart-checkout-btn" onClick={placeOrder}>
            Place Order · ${cartTotal}
          </button>
        </div>
      )}
    </div>
  );
}
