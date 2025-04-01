import { useEffect, useState } from "react"
import { urls } from "./urls"
import useAuth from "../hooks/useAuth"


const baseUrl = urls.itemsUrl


export const useSearch = () => {
    const { request } = useAuth()
    const [searchItems, setSearchItems] = useState([]);
    const [searchParams, setsearchParams] = useState('')

    useEffect(() => {

        const fetchSearch = async () => {
            const response =await request.get(baseUrl);
            try {
                
                if (searchParams === '') {
                    setSearchItems(response);
                    
                } else {
                    const regex = new RegExp(searchParams, 'i');
        
                    const filteredItems = response.filter(item =>
                        regex.test(item.title)  
                    );
        
                    setSearchItems(filteredItems);
                }

            } catch (error) {
                console.log(error);
                
            }
   

        }
        fetchSearch()
    }, [searchParams])

    const search = (searchedData) => {
        setsearchParams(searchedData)

    }

    return {
        search, searchItems
    }

}