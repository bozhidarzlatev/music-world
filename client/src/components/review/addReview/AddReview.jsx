import { useState } from "react";
import { useCreateReview } from "../../../api/reviewApi";

export default function AddReview({
    closeReview,
    itemId,
    user,
    category
}) {

    const { create } = useCreateReview()
    const [selectedRating, setSelectedRating] = useState(1);

    const onSubmitReview = async (formData) => {
        const reviewData = Object.fromEntries(formData);
        await create({ ...reviewData, itemId, user })
        
        closeReview()
    }

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-none bg-opacity-10 backdrop-blur-sm">
            <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-lg relative">
                <h2 className="text-3xl font-semibold text-center mb-8">Leave a Review</h2>
                <form className="space-y-6" action={onSubmitReview}>
                    {/* Review Textarea */}
                    <div className="space-y-4">
                        <textarea
                            name="review"
                            placeholder="Write your review..."
                            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="5"
                        ></textarea>
                    </div>

                    {/* Rating (5 Stars) */}
                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <label key={value} className="flex items-center">
                                <input
                                    type="radio"
                                    name="rating"
                                    value={value}
                                    checked={selectedRating === value}
                                    onChange={() => setSelectedRating(value)}
                                    className="hidden"
                                />
                                <span
                                    className={`text-2xl cursor-pointer ${selectedRating >= value
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                >
                                    ★
                                </span>
                            </label>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-lg font-medium"
                    >
                        Submit Review
                    </button>
                </form>

                {/* Close Button for Modal */}
                <button
                    onClick={closeReview}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    X
                </button>

            </div>
        </div>
    )
}