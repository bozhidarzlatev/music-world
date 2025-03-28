import { useEffect, useState } from "react"
import useAuth from "../hooks/useAuth"
import { urls } from "./urls"


export const useProfile = () => {
    const { avatar, firstName, lastName, email, _id, request } = useAuth()
    const [ profileCounts, setProfileCounts ] = useState({})

    const profile = { avatar, firstName, lastName, email, _id }

    useEffect(() => {
        const searchParams = new URLSearchParams({
            where: `_ownerId="${_id}"`,
        });

        const fetchItemsCount = async () => {
            try {
                const response = await request.get(`${urls.itemsUrl}?${searchParams.toString()}`);
                
                setProfileCounts(prev => prev = {...prev, items: response.length});
            } catch (error) {
                console.error("Failed to fetch items:", error);
            }
        };

        const fetchReviewCount = async () => {
            try {
                const response = await request.get(`${urls.reviewsUrl}?${searchParams.toString()}`);
                
                setProfileCounts(prev => prev = {...prev, reviews: response.length});
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };

        const fetchOrdersCount = async () => {
            try {
                const response = await request.get(`${urls.ordersUrl}?${searchParams.toString()}`);
                
                setProfileCounts(prev => prev = {...prev, orders: response.length});
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        };

        fetchItemsCount();
        fetchReviewCount();
        fetchOrdersCount();
    }, [_id])

    return {
        profile, profileCounts
    }

}