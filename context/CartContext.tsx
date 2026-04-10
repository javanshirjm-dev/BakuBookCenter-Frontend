// frontend/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the Context
const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // 2. Load the cart from LocalStorage when the page loads
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // 3. Save the cart to LocalStorage every time it changes
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    // 4. The function to add a book to the cart
    const addToCart = (book: any) => {
        setCart((prevCart) => {
            // Check if book is already in cart
            const existingBook = prevCart.find((item) => item._id === book._id);
            if (existingBook) {
                return prevCart.map((item) =>
                    item._id === book._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // If not, add it with quantity 1 (use discounted price if available, otherwise regular price)
            const displayPrice = book.hasDiscount && book.discountedPrice ? book.discountedPrice : book.price || 15.99;
            const cartItem = {
                ...book,
                quantity: 1,
                price: displayPrice,
                originalPrice: book.price || 15.99
            };
            return [...prevCart, cartItem];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item._id !== id));
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}

// 5. A custom hook to use the cart anywhere!
export const useCart = () => useContext(CartContext);