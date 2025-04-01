import { useEffect, useState } from "react"
import { urls } from "./urls"
import useAuth from "../hooks/useAuth"


const baseUrl = urls.itemsUrl


export const useSearch = (currentPage) => {
    const { request } = useAuth()
    const [searchItems, setSearchItems] = useState([]);
    const [searchParams, setsearchParams] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [found, setFound] = useState(0)

    currentPage -= 1

    useEffect(() => {

        const fetchSearch = async () => {
            const response = await request.get(`${baseUrl}?offset=${currentPage * 12}&pageSize=${12}`);
            const responceCount = await request.get(baseUrl);
            setTotalItems(Number(responceCount.length));
            
            try {

                if (searchParams === '') {
                    setSearchItems(response);

                } else {
                    const regex = new RegExp(searchParams, 'i');

                    const filteredItems = response.filter(item =>
                        regex.test(item.title)
                    );
                    const totalFound = responceCount.filter(item =>
                        regex.test(item.title)
                    );
                    
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
        search, searchItems, totalItems, found
    }

}