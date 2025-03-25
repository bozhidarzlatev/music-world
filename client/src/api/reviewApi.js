import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";


const baseUrl = 'http://localhost:3030/data/reviews';



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