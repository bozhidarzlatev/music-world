import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import request from "../utils/request";


const baseUrl = 'http://localhost:3030/data/items';
const baseReviewUrl = 'http://localhost:3030/data/reviews';


export const useCreateItem = () => {
    const { request } = useAuth()

    const create = (itemData) => {
        request.post(baseUrl, itemData)
    }

    return {
        create
    }
}

export const useItems = (categoriId, currentPage) => {
    const [items, setItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0)
  
    currentPage -= 1
    const searchParams = new URLSearchParams({
        where: `category="${categoriId}"`,

    })

    useEffect(() => {

        request.get(`${baseUrl}?${searchParams.toString()}&offset=${currentPage  * 12}&pageSize=${12}`)
            .then(setItems)

    }, [currentPage])

    useEffect(() => {
        request.get(`${baseUrl}?${searchParams.toString()}`)
            .then(response => setTotalItems(Number(response.length)))
    }, [])

    return { items, totalItems }

}

export const useItem = (itemId) => {
    const [item, setItem] = useState({});

    useEffect(() => {
        request.get(`${baseUrl}/${itemId}`)
            .then(setItem);
    }, [itemId])

    return {
        item,
    };
};

export const useEditItem = () => {
    const { request } = useAuth()

    const edit = (itemId, itemData) =>
        request.put(`${baseUrl}/${itemId}`, { ...itemData, _id: itemId });

    return {
        edit
    }
}

export const useDeleteItem = () => {
    const { request } = useAuth();

    const deleteItem = (itemId) =>
        request.delete(`${baseUrl}/${itemId}`);

    return {
        deleteItem,
    }


}

export const useLatestUploads = () => {
    const [latestItems, setLatestItems] = useState([])
    const {request} = useAuth()

    useEffect(() =>{
        const searchParams = new URLSearchParams({
            sortBy: '_createdOn desc',
            pageSize: 4,
            select: `title,descriptions,price,imageUrl,category,_id`,
        })

        request.get(`${baseUrl}?${searchParams.toString()}`)
            .then(setLatestItems)

    }, [])

    return {
        latestItems
    }
};
export const useTopRatingUploads = () => {
    const [topRatingtItems, setTopRatingItems] = useState([])
    const {request} = useAuth()

    useEffect(() =>{
        const searchParams = new URLSearchParams({

            load: `data=itemId:items`

        })

        request.get(`${baseReviewUrl}?${searchParams.toString()}`)
            .then(setTopRatingItems)

    }, [])

    return {
        topRatingtItems
    }
};