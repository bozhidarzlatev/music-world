import { Link, useParams } from 'react-router';
import { useItems } from "../../api/itemApi";
import CatalogCard from "./CatalogCard";
import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Spinner from '../spinner/Spinner';


export default function Catalog() {
  const { categoriId } = useParams();
  const [currentPage, setCurrentPage] = useState(1)
  const { items, totalItems, loading } = useItems(categoriId, currentPage)

  const pageSize = 12;
  const totalPages = Math.ceil(totalItems / pageSize)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  
  if (loading ) {
    return <Spinner />
  }

  console.log(JSON.stringify(items));
  

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      


      {totalItems === 0
        ?
        <>
          <h1 className="text-3xl font-bold text-center mb-8">No {categoriId} yet</h1>

          <Link to={`/create/${categoriId}`} className="text-black-600 hover:text-green-600 flex items-center justify-center relative group">
                            <PlusCircle className="w-15 h-15" />
                            <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                                Add New
                            </span>
                        </Link>
        </>
        :
        <>
          <h1 className="text-3xl font-bold text-center mb-8">{categoriId.slice(0,1).toUpperCase()}{categoriId.slice(1)} Catalog - {totalItems} items</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {items.map((item) =>
              <CatalogCard categoriId={categoriId} item={item} />
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
        </>
      }

    </div>
  );


};


