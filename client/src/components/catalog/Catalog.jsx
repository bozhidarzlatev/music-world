import { useParams } from 'react-router';
import { useItems } from "../../api/itemApi";
import CatalogCard from "./CatalogCard";
import { useState } from 'react';


export default function Catalog() {
  const { categoriId } = useParams();
  const [currentPage, setCurrentPage] = useState(1)
  const { items, totalItems } = useItems(categoriId, currentPage )

  const pageSize = 12;
  const totalPages = Math.ceil(totalItems / pageSize )

  const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">{categoriId} Catalog - {totalItems} items</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.map((item) =>
          <CatalogCard categoriId={categoriId} item={item}  />
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


};


