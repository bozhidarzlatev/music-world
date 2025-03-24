import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import request from "../utils/request";


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

export const useItems = (categoriId) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        request.get(`${baseUrl}?where=category%3D%22${categoriId}%22`)
            .then(setItems)

    }, [])

    return { items }

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