import { useEffect, useState } from "react"
import { urls } from "./urls"
import useAuth from "../hooks/useAuth"


const baseUrl = urls.itemsUrl


export const useSearch = (currentPage) => {
    const { request } = useAuth()
    const [searchItems, setSearchItems] = useState([]);
    const [searchParams, setsearchParams] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [found, setFound] = useState(0);
    const [isInSearched, setIsInSearched] = useState(false)

    currentPage -= 1

    useEffect(() => {

        const fetchSearch = async () => {
            const response = await request.get(`${baseUrl}?offset=${currentPage * 12}&pageSize=${12}`);
            const responceCount = await request.get(baseUrl);
            setTotalItems(Number(responceCount.length));
            
            try {

                if (searchParams === '') {
                    setIsInSearched(false)
                    setSearchItems(response);

                } else {
                    setIsInSearched(true)
                    const regex = new RegExp(searchParams, 'i');
                    const start = currentPage * 12 
                    const end = (currentPage + 1 )* 12
                    const filteredItems = responceCount.filter(item => regex.test(item.title)).slice(start , end);
                    
                    setFound(filteredItems.length);
                    setSearchItems(filteredItems);
                }

            } catch (error) {
                console.log(error);
            }


        }
        fetchSearch()
    }, [searchParams, currentPage])

    const search = (searchedData) => {
        setsearchParams(searchedData)

    }

    return {
        search, searchItems, totalItems, found, isInSearched
    }

}