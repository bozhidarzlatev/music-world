import { useState } from "react";
import { useCreateReview } from "../../../api/reviewApi";

export default function AddReview({
    closeReview,
    onCreate
}) {

    const [selectedRating, setSelectedRating] = useState(1);


    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-none bg-opacity-10 backdrop-blur-sm" onClick={closeReview}>
            <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-3xl font-semibold text-center mb-8">Leave a Review</h2>
                <form className="space-y-6" action={onCreate}>
                    <div className="space-y-4">
                        <textarea
                            name="review"
                            placeholder="Write your review..."
                            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="5"
                        ></textarea>
                    </div>

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