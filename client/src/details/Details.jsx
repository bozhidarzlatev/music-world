import { useParams } from 'react-router';
import { useItem } from '../api/itemApi';

export default function Details() {
    const { categoriId, itemId } = useParams();
    const { item } = useItem(itemId)


    if (!item) {
        return <div>Item not found</div>;
    }


    return (
        <div className="min-h-screen bg-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="relative w-full" >
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                    />
                </div>

                {/* Middle: Product Info */}
                <div className="flex flex-col justify-between p-6 space-y-4">
                    <h1 className="text-3xl font-semibold">{item.title}</h1>
                    <p className="text-gray-500 text-lg">{item.category}</p>

                    {/* Rating */}
                    {/* <div className="flex items-center mt-4">
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

                    <div className="mt-4 text-gray-700">
                        <h3 className="font-semibold text-xl">Desctiption:</h3>
                        <p>{item.descriptions}</p>
                    </div>
                    <p className="text-xl font-bold text-green-500 mt-4">{Number(item.price).toFixed(2)} lv</p>

                    {/* Product Description */}
                </div>

                {/* Right: Buttons & Price */}
                <div className="flex flex-col space-y-4 p-6">
                    <button className="w-full bg-green-600 text-white py-3 rounded-md transition-transform transform hover:scale-105 hover:bg-green-700 hover:shadow-lg">
                        Buy Now
                    </button>
                    <button className="w-full bg-gray-300 text-black py-3 rounded-md hover:bg-gray-400 transition-colors">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

