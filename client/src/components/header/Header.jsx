import { useContext, useEffect, useState } from "react"
import styles from "./Header.module.css"
import { Link } from "react-router"
import { UserContext, useUserContext } from "../../contexts/UserContext"
import { PlusCircle, LogOut, Grid, LogIn, UserPlus } from "lucide-react";
import { useCartData } from "../../api/cartApi";

export default function Header() {
    const { firstName, avatar , _id} = useUserContext(UserContext);
    const {cart} = useCartData(_id)
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        console.log('Cart data received in Header:', cart); // Log cart data in Header
        if (cart) {
            setCartCount(cart.length); // Set cart count dynamically based on cart items
        }
    }, [cart]);
 

    return (
        <header>
            <div className={styles.main}>
                <Link to="/" className="text-white-700 hover:text-blue-900 flex items-center space-x-2 relative group">
                    <img src="/logo.svg" alt="Music World Logo" />
                    <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                        Home
                    </span>
                </Link>
                <p>Music World</p>
            </div>
                <p>Cart: {cartCount}</p>
            <nav>
                <Link to="/categories" className="text-white-700 hover:text-blue-900 flex items-center space-x-2 relative group">
                    <Grid className="w-15 h-15" />
                    <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                        Browse All
                    </span>
                </Link>




                {firstName ? (
                    <div className={styles.user}>
                        <Link to="/create" className="text-blue-600 hover:text-blue-800 flex items-center justify-center relative group">
                            <PlusCircle className="w-15 h-15" />
                            <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                                Add New
                            </span>
                        </Link>

                        <Link to="/profile" className="text-white-700 hover:text-blue-900 flex items-center space-x-2 relative group">
                            <img src={avatar} alt="" className="w-15 h-15 rounded-full" />
                            <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                                {`Welcome, ${firstName}`}
                            </span>
                        </Link>

                        <Link to="/logout" className="text-red-600 hover:text-red-800 flex items-center justify-center relative group">
                            <LogOut className="w-15 h-15" />
                            <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                                Log Out
                            </span>
                        </Link>
                    </div>)
                    : (<div className={styles.guest}>
                        <Link to="/login" className="text-blue-600 hover:text-blue-800 flex items-center justify-center relative group">
                            <LogIn className="w-15 h-15" />
                            <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                                Login
                            </span>
                        </Link>

                        <Link to="/register" className="text-green-600 hover:text-green-800 flex items-center justify-center relative group">
                            <UserPlus className="w-15 h-15" />
                            <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                                Register
                            </span>
                        </Link>
                    </div>)
                }

            </nav>
        </header>
    )
}