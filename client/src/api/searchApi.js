import { useState } from "react"
import { urls } from "./urls"
import useAuth from "../hooks/useAuth"


const baseUrl = urls.itemsUrl


export const useSearch = () => {
    const {request} = useAuth()
    const [searchItems, setSearchItems] = useState([])

    const search = (searchedData) => {
        const responce = request.get(baseUrl)
        console.log(responce);
        
    } 

    return {
        searchItems
    }

}