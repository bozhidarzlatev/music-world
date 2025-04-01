import { useRef, useState } from 'react';
import Spinner from '../spinner/Spinner';
import CatalogCard from '../catalog/CatalogCard';
import { useSearch } from '../../api/searchApi';


export default function Catalog() {
    const [currentPage, setCurrentPage] = useState(1)
    const {search, searchItems, totalItems} = useSearch(currentPage)

    const pageSize = 12;
    const totalPages = Math.ceil(totalItems / pageSize)

    const timeoutRef = useRef(null)
    console.log(currentPage);
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };


    // if (loading) {
    //     return <Spinner />
    // }
    

    const onSearch = (e) => {
        const searchData = e.target.value; 
        
        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            search(searchData);  
        }, 300); 
      };

    

    return (
        <div className="min-h-screen bg-gray-100 p-8">


            <h1 className="text-3xl font-bold text-center mb-8">Search items: {searchItems.length !== totalItems ? `${searchItems.length} mathes`:` ${totalItems} total items`} </h1>
            <div className="flex justify-center mb-6">
                <input
                    type="text"
                    placeholder="Search items..."
                    onChange={onSearch}
                    className="px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mr-2 w-full sm:w-64"
                />

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {searchItems.map((item) =>
                    <CatalogCard categoriId={item.category} item={item} />
                )}
            </div>
            <div className="flex justify-center mt-6">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-300 rounded-md mr-2 disabled:bg-gray-200"
                >
                    Prev
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 mx-1 rounded-md ${currentPage === index + 1 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
                    >
                        {index + 1}
                    </button>
                ))} 
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-300 rounded-md ml-2 disabled:bg-gray-200"
                >
                    Next
                </button>
            </div>


        </div>
    );

}