import useAuth from "../hooks/useAuth";


const baseUrl = 'http://localhost:3030/data/items';


export const useCreateItem = () => {
    const { request } = useAuth()

    const create = (itemData) => {
        request.post(baseUrl, itemData)
    }

    return {
        create
    }

}