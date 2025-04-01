import { createContext, useContext } from 'react';


export const CartContext = createContext();


export function useCartContext () {
    const data = useContext(CartContext)
    return data
}
