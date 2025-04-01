import React, { createContext, useContext, useState } from 'react';


export const CartContext = createContext();


export function useCartCount () {
    const data = useContext(CartContext)
    return data
}
