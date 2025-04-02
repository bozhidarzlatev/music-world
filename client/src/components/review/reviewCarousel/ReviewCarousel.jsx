import { motion } from "framer-motion";

export default function ReviewCarousel({ topReviews }) {

    topReviews.map(review => review._createdOn = new Date(review._createdOn).toLocaleDateString())

    return (
        <div className="overflow-hidden w-full bg-none-100 py-4">
            <motion.div
                className="flex space-x-6"
                initial={{ x: "0%" }}
                animate={{ x: "-100%" }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            >
                {topReviews.concat().map((review, index) => (
                    <div key={review._id} className="min-w-[300px] p-6 rounded-lg shadow-lg bg-white">

                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {review.user}
                                </h3>

                                 <div className="flex justify-around items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`text-2xl ${i < review.rating
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                            <span className="text-gray-500 text-sm ml-15">{review._createdOn}</span>
                                </div>
                                
                            </div>
                        </div>


                        <p className="mt-4 text-gray-600">
                            {review.review}
                        </p>

                    </div>
                ))}
            </motion.div>
        </div>
    )
}