import { useEffect, useState } from "react";
import request from "../utils/request";
import useAuth from "../hooks/useAuth";


const baseUrl = 'http://localhost:3030/data/carts';

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
    }, [userId])

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

    return {
        cart, updateCart
    }
}


