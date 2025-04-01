import { useState } from "react";
import { CartContext } from "../contexts/CartContext";

export const CartyProvider = ({
    children
}) => {
    const [cartItemsCount, setCartItemsCount] = useState(0);

    const addToCart = (data) => {
        setCartItemsCount(data)
    }


    return (
        <CartContext.Provider value={{cartItemsCount, addToCart}}>
            {children}
        </CartContext.Provider>

    );
}