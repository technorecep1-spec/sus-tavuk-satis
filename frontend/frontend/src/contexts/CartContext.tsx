import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrls: string[];
  qty: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQty: (id: string, qty: number) => void;
  clearCart: () => void;
  getCartItemsCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: any, qty: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      
      return [...prevItems, {
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrls: product.imageUrls,
        qty
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== id));
  };

  const updateCartItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === id ? { ...item, qty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.qty, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQty,
    clearCart,
    getCartItemsCount,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
