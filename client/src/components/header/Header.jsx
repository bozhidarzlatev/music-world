import { useEffect, useState } from "react"
import styles from "./Header.module.css"
import { Link } from "react-router"
import { UserContext, useUserContext } from "../../contexts/UserContext"
import { PlusCircle, LogOut, Grid, LogIn, UserPlus, ShoppingCart, Search } from "lucide-react";
import { useCartData } from "../../api/cartApi";
import { useCartContext } from "../../contexts/CartContext";
import Toast from "../toast/Toast";
import { useToastContext } from "../../contexts/ToastContext";

export default function Header() {
    const { firstName, avatar, _id } = useUserContext(UserContext);
    const {cart} = useCartData(_id);
    const {cartItemsCount, addToCart} = useCartContext();
    const {toast, hideToast,viewToast} = useToastContext();
   

    useEffect(() => {
        addToCart(cart.length); 

    }, [cart])

    useEffect(() => {

        setTimeout(() =>{
            hideToast()
            
        }, 3000)


    }, [toast])
    

    return (
        <header>
            {viewToast && 
            <Toast message={toast} />
            }
            <div className={styles.main}>
                <Link to="/" className="text-white-700 hover:text-blue-900 flex items-center space-x-2 relative group">
                    <img src="/logo.svg" alt="Music World Logo" />
                    <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                        Home
                    </span>
                </Link>
                <p className={styles.title}>Music World</p>
            </div>
            <nav>
            <div className={styles.items}>
                <Link to="/categories" className="text-white-700 hover:text-blue-900 flex items-center space-x-2 relative group">
                    <Grid className="w-15 h-15" />
                    <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                        Browse All
                    </span>
                </Link>
                <Link to="/search" className="text-white-700 hover:text-blue-900 flex items-center space-x-2 relative group">
                    <Search className="w-15 h-15" />
                    <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                        Search items
                    </span>
                </Link>
                </div>



                {firstName ? (
                    <div className={styles.user}>
                        <Link to="/create" className="text-blue-600 hover:text-blue-800 flex items-center justify-center relative group">
                            <PlusCircle className="w-15 h-15" />
                            <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                                Add New
                            </span>
                        </Link>

                        <Link to="/cart" className={`hover:text-white flex items-center justify-center relative group
                            ${cartItemsCount > 0 
                            ? "text-green-600" 
                            :"text-red-600"
                            }
                             `}>
                            <div className="relative w-15 h-15">
                                <ShoppingCart className="w-15 h-15" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute top-[-5px] right-[-5px] bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </div>
                            <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                                Cart
                            </span>
                        </Link>
                        <Link to="/profile" className="text-white-700 hover:text-blue-900 flex items-center justify-center relative group">
                            <img src={avatar} alt={avatar} className="w-16 h-16 rounded-full object-cover" />
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