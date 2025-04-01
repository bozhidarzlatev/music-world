import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useCartData } from "./cartApi";


const baseUrl = 'http://localhost:3030/data/orders';


export const useCreateOrder = () => {
    const { request, userId } = useAuth()
    const { emptyCart } = useCartData(userId)
    

    const createOrder = async (orderData) => {
        const response = await request.post(baseUrl, { orderData: orderData })

        if (!response) {
            return
        } else {
            const empryCartResponce = await emptyCart()

        }

        return response

    }

    return {
        createOrder
    }

}


export const useUserOrders = () => {
    const { request, userId } = useAuth()
    const [orders, setOrders] = useState([])

    useEffect(() => {

        const searchParams = new URLSearchParams({
            where: `_ownerId="${userId}"`,
        })

        request.get(`${baseUrl}?${searchParams.toString()}`)
            .then(setOrders)
    }, [])


    return {
        orders
    }

}