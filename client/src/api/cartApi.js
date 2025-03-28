import { useEffect, useState } from "react";
import request from "../utils/request";
import useAuth from "../hooks/useAuth";
import { useItem, useItems } from "./itemApi";


const baseUrl = 'http://localhost:3030/data/carts';
const itemUrl = 'http://localhost:3030/data/items';

export const useCreateCart = () => {
    const create = async (accessToken) => {
        const data = {
            items: []
        }
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': accessToken,
            },
            body: JSON.stringify(data)
        }
        return response = await fetch(baseUrl, options)
    }
    return {
        create
    }
}

export const useCartData = (userId) => {
    const [cart, setCart] = useState([])
    const [cartId, setCartId] = useState('')
    const { request } = useAuth()


    useEffect(() => {
        request.get(`${baseUrl}?where=_ownerId%3D%22${userId}%22`)
            .then(response => {
                if (response && response[0]) {
                    setCart(response[0].items);
                    setCartId(response[0]._id);
                }
            })
            .catch(err => console.error('Error fetching cart:', err));
    }, [userId ])

    const updateCart = (item) => {
        const dataToPush = [
            ...cart,
            item
        ]

        request.put(`${baseUrl}/${cartId}`, { items: dataToPush })
            .then(() => {
                setCart(dataToPush); 
            })
    }

    const emptyCart = ( ) => {
        const dataToPush = [
              ]
              
        request.put(`${baseUrl}/${cartId}`, { items: dataToPush })
            .then(() => {
                setCart(dataToPush); 
                
            })
    }

    return {
        cart, updateCart, emptyCart
    }
}

export const useUserCart = () => {
    const {request ,userId} = useAuth();
    const [userCart, setUserCart] = useState([]);

    useEffect(() => {

        const searchParams = new URLSearchParams({
            where: `_ownerId="${userId}"`,
            select: `items`
        })
        
        request.get(`${baseUrl}?${searchParams.toString()}`)
            .then(response => 
                 response[0].items.map(cartItems => 
                    request.get(`${itemUrl}/${cartItems}`)
                        .then( responseItem => {
                            setUserCart(prev=> [...prev, responseItem]);
                            
                        })
                    
                ))
                
          

    }, [])
    
    return {
        userCart
    }
}
