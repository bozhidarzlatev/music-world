import { Link, useNavigate } from "react-router";
import { useUserCart } from "../../api/cartApi";
import { useCreateOrder } from "../../api/orderApi";
import useAuth from "../../hooks/useAuth";

export default function Cart() {
    const { userCart } = useUserCart()
    const { createOrder } = useCreateOrder()
    const {userId} = useAuth()
    const navigate = useNavigate()

    const onPlaceOrderHandler = async () => {

        const responce = await createOrder(userCart, userId)
        navigate(`/orders`)
        
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
            {userCart.length > 0 ? (
                <>
                <div className="space-y-4">
                    {userCart.map((item, index) => (
                        <Link  key={index} to={`/categories/${item.category}/${item._id}/details`}>

                            <div className="flex items-center gap-6 border-b pb-4 last:border-b-0">
                                <img src={item.imageUrl} alt={item.title} className="w-24 h-24 rounded-md object-cover" />

                                <div className="flex-1 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-medium">{item.title}</h3>
                                        <p className="text-gray-500 text-sm">{item.description}</p>
                                    </div>
                                    <p className="text-xl font-semibold text-green-600">{Number(item.price).toFixed(2)} lv</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                            <div className="mt-6">
                <button onClick={onPlaceOrderHandler} className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">
                    Place Order
                </button>
            </div>
            </>
            ) : (
                <p className="text-gray-500 text-center">Your cart is empty.</p>
            )}


        </div>
    );
}
