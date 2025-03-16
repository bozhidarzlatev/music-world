import {Link} from "react-router"
import { useParams } from 'react-router';

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
  export default function Catalog(){
    const {categoriId } = useParams();

    return (
        <div className="min-h-screen bg-gray-100 p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Product Catalog</h1>
      
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link
                to={`/categories/${categoriId}/${product.id}/details`}
                key={product.id}
                className="block"
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden cursor-pointer">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">{product.title}</h2>
                    <p className="text-gray-500 text-sm">{product.category}</p>
                    <p className="text-xl font-bold text-green-500">{product.price}</p>
      
                    {/* Rating */}
                    <div className="flex items-center mt-2">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={index}
                          className={`text-yellow-400 ${
                            index < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{product.rating}</span>
                    </div>
      
                    {/* Buy Button */}
                    <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-md transition-transform transform hover:scale-105 hover:bg-green-700 hover:shadow-lg">
                      Buy Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
      
      
};
  
  
  