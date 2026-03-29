"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  // 1. Initial Load: LocalStorage se seedha data uthao (Safe Method)
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // 2. Data Save: Jab bhi Cart change ho, LocalStorage me daal do
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // 3. Add to Cart (Bug Fixed: React Strict Mode Double Call Fix)
  const addToCart = (product, quantity = 1) => {
    // Check inside the current cart state (Not inside setCart callback)
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      // Agar pehle se hai toh sirf Quantity badhao
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      ));
      toast.success("Cart Updated!");
    } else {
      // Agar naya item hai toh usko add karo
      setCart([...cart, { ...product, quantity }]);
      toast.success("Added to Cart! 🛒");
    }
  };

  // 4. Remove Item
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
    toast.error("Item Removed");
  };

  // 5. Update Quantity (+ / - buttons ke liye)
  const updateQuantity = (id, action) => {
    setCart(cart.map((item) => {
      if (item.id === id) {
        if (action === 'increase') return { ...item, quantity: item.quantity + 1 };
        if (action === 'decrease' && item.quantity > 1) return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }));
  };

  // 6. Clear Cart (Checkout ke baad)
  const clearCart = () => setCart([]);

  // Total Price Calculator
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);