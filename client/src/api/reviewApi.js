import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { urls } from "./urls";


const baseUrl = urls.reviewsUrl;



export const useReviews = (itemId) => {
    const { request } = useAuth()
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        request.get(`${baseUrl}?where=itemId%3D%22${itemId}%22`)
            .then(setReviews)
        
    }, [itemId])

    return {
        reviews,
        setReviews
    }

}

export const useCreateReview = () => {
    const { request } = useAuth()
    
    const create = (reviewData) => {
        return request.post(baseUrl, reviewData)
    }
    
    return {
        create
        
    }
}

export const useCanReview= (itemId) => {
    const { request, userId } = useAuth()
    const [hasReview, setHasReview] = useState(false)
    const [hasBought, setHasBought] = useState(false)

    
    useEffect(()=> {
        const searchParams = new URLSearchParams({
            where: `itemId="${itemId}"`,
        });

        const hasReviewed = async () => {
            try {
                const response = await request.get(`${baseUrl}?${searchParams.toString()}`)
                const result = response.filter(a => a._ownerId === userId).length > 0 ? true : false;
                setHasReview(result);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        };


        const hasBought = async () => {
            const searchParams = new URLSearchParams({
                where: `_ownerId="${userId}"`,
            });
            try {
                const response = await request.get(`${urls.ordersUrl}?${searchParams.toString()}`)
                response.some( order => {
                    order.orderData.some( item => {
                        item._id === itemId ? setHasBought(true) : null 

                    })
                    
                })
                
                
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        };
        
        hasReviewed()
        hasBought()
    }, [itemId, request])

    return {
        hasReview, hasBought
    }

}

export const useTopReviews = () => {
    const [topReviews, setTopReviews] = useState([])
    const {request} = useAuth()

    useEffect(() =>{
        const searchParams = new URLSearchParams({
            where: `rating>="4"`,
        });

        request.get(`${urls.reviewsUrl}?${searchParams}`)
            .then(setTopReviews);
        
    }, [])

    return {
        topReviews
    }
} 

export const useUserReview = () => {
    const {userId, request} = useAuth();
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const searchParams = new URLSearchParams({
            where: `_ownerId="${userId}"`,
        });

        const fetchReviews = async () => {
            try {
                const response = await request.get(`${baseUrl}?${searchParams.toString()}&load=data%3DitemId%3Aitems`);
                
                setReviews(response);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };

        fetchReviews()
    }, [userId])

    return {
        reviews
    }
}