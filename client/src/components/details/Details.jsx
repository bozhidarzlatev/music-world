import { Link, useNavigate, useParams } from 'react-router';
import { useDeleteItem, useItem } from '../../api/itemApi';
import useAuth from '../../hooks/useAuth';
import { useOptimistic, useState } from 'react';
import AddReview from '../review/addReview/AddReview';
import ShowReview from '../review/showReview/ShowReview';
import { useCanReview, useCreateReview, useReviews } from '../../api/reviewApi';
import { v4 as uuid } from 'uuid'
import { useCartData } from '../../api/cartApi';
import { useCartContext } from '../../contexts/CartContext';
import { useToastContext } from '../../contexts/ToastContext';

export default function Details() {
    const { categoriId, itemId } = useParams();
    const { item } = useItem(itemId)
    const { _id: userId, firstName, lastName } = useAuth()
    const { deleteItem } = useDeleteItem()
    const navigate = useNavigate()
    const [review, setReview] = useState(false);
    const { create } = useCreateReview()
    const { reviews, setReviews } = useReviews(itemId)
    const { cart, updateCart } = useCartData(userId)
    const { hasReview, hasBought } = useCanReview(itemId)
    const { addToCart } = useCartContext()
    const {addToast , showToast} = useToastContext()
    const [optimisticReviews, setOptimisticReviews] = useOptimistic(reviews)

    let rating = 0;
    reviews.map(key => rating += Number(key.rating))

    rating = rating /= reviews.length

    if (!item) {
        return <div>Item not found</div>;
    }


    const onAddReviewHandler = () => {
        setReview(true)
    }

    const onCloseRevieHandler = () => {
        setReview(false)
    }

    const onDeleteItemHandler = async () => {
        if (userId !== item._ownerId) {
            return <Navigate to="/categories" />
        }

        try {
            const responce = await deleteItem(itemId)
            if (!!responce._deletedOn !== true) {
                addToast({ code: 403, message: responce.message });
                showToast()
                throw new Error(responce.message);
            }
            addToast({ code: 200, message: `Item was successfully deleted!` });
            showToast()
            navigate(`/categories/${categoriId}`)

        } catch (error) {
            
            console.log(error);
        }
        
    }

    const reviewCreateHandler = async (formData) => {
        const newReview = Object.fromEntries(formData);
        const user = `${firstName} ${lastName}`
        const newOptimisticReview = {
            ...newReview,
            user,
            itemId,
            pending: true,
            _id: uuid()
        }

        setOptimisticReviews((optimisticState) => [...optimisticState, newOptimisticReview])

        const reviewResult = await create({ ...newReview, itemId, user })

        setReviews(prev => [...prev, reviewResult])
        onCloseRevieHandler()
    }

    const isOwner = userId === item._ownerId;

    const onAddToCartHandler = () => {
        const cartDataItems = cart
        const dataToPush = [
            ...cartDataItems,
            item._id
        ]
            console.log(addToCart);
            
        updateCart(item._id)
        addToCart(dataToPush.length)
    }




    return (
        <div className="min-h-screen bg-gray-200 p-8 ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="relative w-full">
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                    />
                </div>

                <div className="flex flex-col justify-between p-6 space-y-4">
                    <h1 className="text-3xl font-semibold">{item.title}</h1>
                    <p className="text-gray-500 text-lg">{item.category}</p>
                    {item.subCategory && <p className="text-gray-500 text-lg">{item.subCategory}</p>}
                    {item.color && <p className="text-gray-500 text-lg">{item.color}</p>}
                    {item.manufacturer &&
                        <div className="mt-4 text-gray-700">
                            <h3 className="font-semibold text-xl">Manufacturer:</h3>
                            <p>{item.manufacturer} </p>
                        </div>
                    }
                    {item.artist &&
                        <h3 className="font-semibold text-xl">{item.artist}</h3>
                    }

                    {item.date && <p className="text-gray-500 text-lg">{item.date}</p>}
                    {item.genre && <p className="text-gray-500 text-lg">{item.genre}</p>}
                    {item.city && <p className="text-gray-500 text-lg">{item.city}</p>}
                    {item.venue && <p className="text-gray-500 text-lg">{item.venue}</p>}


                    <div className="mt-4 text-gray-700">
                        <h3 className="font-semibold text-xl">Rating:</h3>
                        {rating === 0
                            ? <p>Not rated yet </p>
                            :

                            <div className="flex space-x-1">
                                {[...Array(5)].map((_, index) => (
                                    <span
                                        key={index}
                                        className={`text-2xl  ${index < rating ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        }
                    </div>


                    <div className="mt-4 text-gray-700">
                        <h3 className="font-semibold text-xl">Description:</h3>
                        <p>{item.descriptions}</p>
                    </div>

                    <div className="mt-4 text-gray-700">
                        <h3 className="font-semibold text-xl">Owner:</h3>
                        <p>{item.uploadedBy} </p>
                    </div>
                </div>

                <div className="flex flex-col space-y-4 p-6">
                    <div className="mt-4 text-gray-700 flex items-center space-x-2">
                        <h3 className="font-semibold text-xl">Price:</h3>
                        <p className="text-xl font-bold text-green-500">{Number(item.price).toFixed(2)} lv</p>
                    </div>
                    <button onClick={onAddToCartHandler} className="w-full bg-green-600 text-white py-3 rounded-md transition-transform transform hover:scale-105 hover:bg-green-700 hover:shadow-lg">
                        Add to Cart
                    </button>

                    {isOwner && (
                        <>
                            <Link
                                to={`/categories/${categoriId}/${itemId}/edit`}
                                className="w-full bg-gray-300 text-black py-3 rounded-md hover:bg-blue-400 transition-colors flex items-center justify-center"
                            >
                                Edit Item
                            </Link>
                            <button
                                onClick={onDeleteItemHandler}
                                className="w-full bg-gray-300 text-black py-3 rounded-md hover:bg-red-400 transition-colors"
                            >
                                Delete Item
                            </button>
                        </>
                    )}

                    {!isOwner && hasBought && !hasReview
                        ?
                        <button
                            onClick={onAddReviewHandler}
                            className="w-full bg-purple-800 text-white py-3 rounded-md hover:bg-yellow-400 hover:text-black transition-colors"
                        >
                            Add review
                        </button>
                        : null
                    }
                </div>
            </div>

            <ShowReview reviews={optimisticReviews} />

            {review && (
                <AddReview
                    closeReview={onCloseRevieHandler}
                    onCreate={reviewCreateHandler}
                />
            )}
        </div>
    );


};

