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

    return {items}

}