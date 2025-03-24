import useAuth from "../hooks/useAuth";


const baseUrl = 'http://localhost:3030/data/reviews';

export const useCreateReview = () => {
    const { request } = useAuth()

    const create = (reviewData) => {
        request.post(baseUrl, reviewData)
    }

    return {
        create
    }
}