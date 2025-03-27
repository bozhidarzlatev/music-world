import { Link } from "react-router";

export default function CatalogCard({
    categoriId, item
}) {

    return (
        <Link
            to={`/categories/${categoriId}/${item._id}/details`}
            key={item._id}
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
                    <h2 className="text-gray-500 text-sm">{item.category}</h2>
                    <p className="text-xl font-bold text-green-500">{Number(item.price).toFixed(2)} lv</p>

                    {item.rating &&
                        <>
                            <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, index) => (
                                    <span
                                    key={index}
                                    className={`text-2xl  ${index < item.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                >
                                        ★
                                    </span>
                                ))}
                                <span className="text-sm text-gray-600 ml-2">{item.rating}</span>
                            </div>
 
                        </>
                    }

                    <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-md transition-transform transform hover:scale-105 hover:bg-green-700 hover:shadow-lg">
                        View
                    </button>
                </div>
            </div>
        </Link>
    )
}