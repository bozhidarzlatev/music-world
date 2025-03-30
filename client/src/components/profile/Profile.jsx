import { Link } from "react-router";
import { useProfile } from "../../api/profileApi";
import { useCartData } from "../../api/cartApi";

export default function Profile(){
    const {profile, profileCounts} = useProfile();
    const {cart} = useCartData(profile._id)


    return (
        <div className="min-h-screen bg-gray-200 p-8">
            <div className="max-w-4xl mx-auto bg-gray-50 p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative w-full flex flex-col items-center">
                    <img
                        src={profile.avatar}
                        alt={profile.firstName}
                        className="w-40 h-40 object-cover rounded-full shadow-md"
                    />
                    <h1 className="text-3xl font-semibold mt-4">{profile.firstName} {profile.lastName}</h1>
                    <p className="text-gray-500 text-lg">{profile.email}</p>
                </div>

                <div className="flex flex-col space-y-4 p-6 md:col-span-2">
                    <Link 
                        to="/cart"
                        className="w-full bg-green-600 text-white py-3 rounded-md transition-transform transform hover:scale-105 hover:bg-green-700 hover:shadow-lg text-center"
                    >
                        View Cart - {cart.length}
                    </Link>
                    
                    <Link 
                        to="/orders"
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-700 transition-transform transform hover:scale-105 transition-colors text-center"
                    >
                        My Orders - {profileCounts.orders}
                    </Link>
                    
                    <Link 
                        to="/comments"
                        className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-800 transition-transform transform hover:scale-105  transition-colors text-center"
                    >
                        My Reviews - {profileCounts.reviews}
                    </Link>
                    
                    <Link 
                        to="/my-items"
                        className="w-full bg-gray-400 text-white py-3 rounded-md hover:bg-gray-500 transition-transform transform hover:scale-105  transition-colors text-center"
                    >
                        My Items - {profileCounts.items}
                    </Link>
                </div>
            </div>
        </div>
    );
}