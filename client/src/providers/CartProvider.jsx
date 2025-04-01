import { useState } from "react";
import { CartContext } from "../contexts/CartContext";

export const CartProvider = ({
    children
}) => {
    const [cartItemsCount, setCartItemsCount] = useState(0);

    const addToCart = (data) => {
        setCartItemsCount(prev => prev = data)
    }


    return (
        <CartContext.Provider value={{cartItemsCount, addToCart}}>
            {children}
        </CartContext.Provider>

    );
}