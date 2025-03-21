import { useEffect } from "react";
import { Link } from "react-router"
import { useParams } from 'react-router';
import { useItems } from "../../api/itemApi";

const products = [
  {
    id: 1,
    title: "Acoustic Guitar",
    category: "Instruments",
    price: "$299",
    rating: 4.5,
    image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg",
  },
  {
    id: 33,
    title: "Acoustic Guitar",
    category: "Instruments",
    price: "$299",
    rating: 4.5,
    image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg",
  },
  {
    id: 2,
    title: "Electric Keyboard",
    category: "Instruments",
    price: "$499",
    rating: 4.2,
    image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg",
  },
  {
    id: 3,
    title: "Drum Set",
    category: "Instruments",
    price: "$799",
    rating: 4.8,
    image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg",
  },
];
export default function Catalog() {
  const { categoriId } = useParams();
  const { items } = useItems(categoriId)
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Product Catalog</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.map((item) => 
          <Link
            to={`/categories/${categoriId}/${item._id}/details`}
            key={item.id}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden cursor-pointer">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-gray-500 text-sm">{item.category}</p>
                <p className="text-xl font-bold text-green-500">{item.price}</p>

                {/* <div className="flex items-center mt-2">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={`text-yellow-400 ${index < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"
                        }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{item.rating}</span>
                </div> */}

                <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-md transition-transform transform hover:scale-105 hover:bg-green-700 hover:shadow-lg">
                  Buy Now
                </button>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );


};


