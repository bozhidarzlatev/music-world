import { Link, useNavigate, useParams } from 'react-router';
import { useDeleteItem, useItem } from '../../api/itemApi';
import useAuth from '../../hooks/useAuth';
import { useOptimistic, useState } from 'react';
import AddReview from '../review/addReview/AddReview';
import ShowReview from '../review/showReview/ShowReview';
import { useCreateReview, useReviews } from '../../api/reviewApi';
import {v4 as uuid} from 'uuid'

export default function Details() {
    const { categoriId, itemId } = useParams();
    const { item } = useItem(itemId)
    const { _id: userId, firstName, lastName } = useAuth()
    const { deleteItem } = useDeleteItem()
    const navigate = useNavigate()
    const [review, setReview] = useState(false);
    const {create} = useCreateReview()
    const {reviews, setReviews} = useReviews(itemId)
    const [optimisticReviews, setOptimisticReviews] = useOptimistic(reviews)

    console.log(optimisticReviews);
    

    let rating = 0 ;
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
        if ( userId !== item._ownerId) {
            return <Navigate to="/categories" />
        }
        
        await deleteItem(itemId)
        navigate(`/categories/${categoriId}`)
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
            
        const reviewResult = await create({...newReview, itemId, user })
        
        setReviews(prev => [...prev, reviewResult])
        onCloseRevieHandler()
    }

    const isOwner = userId === item._ownerId;

    return (
        <div className="min-h-screen bg-gray-200 p-8">
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

                        <div className="mt-4 text-gray-700">
                        <h3 className="font-semibold text-xl">Rating:</h3>
                    <div className="flex space-x-1">
                            {[...Array(5)].map((_, index) => (
                                        <span
                                            key={index}
                                            className={`text-2xl  ${
                                                index < rating ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                            </div>
                    </div>
    
                    <div className="mt-4 text-gray-700">
                        <h3 className="font-semibold text-xl">owner:</h3>
                        <p>{item.uploadedBy} </p>
                    </div>
    
                    <div className="mt-4 text-gray-700">
                        <h3 className="font-semibold text-xl">Description:</h3>
                        <p>{item.descriptions}</p>
                    </div>
                    <p className="text-xl font-bold text-green-500 mt-4">{Number(item.price).toFixed(2)} lv</p>
                </div>
    
                <div className="flex flex-col space-y-4 p-6">
                    <button className="w-full bg-green-600 text-white py-3 rounded-md transition-transform transform hover:scale-105 hover:bg-green-700 hover:shadow-lg">
                        Add to Cart
                    </button>
    
                    {isOwner && (
                        <>
                            <Link to={`/categories/${categoriId}/${itemId}/edit`} className="w-full bg-gray-300 text-black py-3 rounded-md hover:bg-gray-400 transition-colors">
                                Edit Item
                            </Link>
                            <button
                                onClick={onDeleteItemHandler}
                                className="w-full bg-gray-300 text-black py-3 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Delete Item
                            </button>
                        </>
                    )}
                    <button
                        onClick={onAddReviewHandler}
                        className="w-full bg-purple-800 text-white py-3 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Add review
                    </button>
                </div>
            </div>
    
            <ShowReview reviews={optimisticReviews}/>
    
            {review && (
                <AddReview 
                    closeReview={onCloseRevieHandler} 
                    onCreate={reviewCreateHandler}
                />
            )}
        </div>
    );
    
    
};

