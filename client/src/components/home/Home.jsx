import { Link } from "react-router";
import { useLatestUploads, useTopRatingUploads } from "../../api/itemApi"
import CatalogCard from "../catalog/CatalogCard"
import styles from "./Home.module.css"

import { motion } from "framer-motion";
import { useTopReviews } from "../../api/reviewApi";



export default function Home() {
    const { latestItems } = useLatestUploads()
    const { topRatingtItems } = useTopRatingUploads();
    const { topReviews } = useTopReviews();
console.log(topRatingtItems);

    let topRating = {};
    topRatingtItems.forEach(item => {
        if (!topRating.hasOwnProperty(item.itemId)) {
            topRating[item.itemId] = { ...item.data, ratings: [item.rating] }

        } else {
            topRating[item.itemId].ratings = [...topRating[item.itemId].ratings, item.rating];
        }


    });

    const items = Object.values(topRating);
    items.forEach(element => {
        let finalRating = 0;
        element.ratings.map(rat => finalRating += Number(rat));
        element.rating = finalRating / element.ratings.length
    });

    const finalItemsa = items.sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 4);




    return (
        <section className={styles["main-section"]}>
            <div className={styles.welcome}>
                <h1>Music World</h1>
                <p>Best place for all music lovers</p>
                <div className={styles.browse}>
                    <Link to="/categories">Browse all categories</Link>
                </div>
            </div>
            <div className={styles.buttons}>
                <div className={styles.login}>
                    <span htmlFor="">Don't have accound?</span>
                    <Link to="/register">Register</Link>
                </div>
                <div className={styles.register}>
                    <span htmlFor="">Already have accound?</span>
                    <Link to="/login">Login</Link>
                </div>
            </div>
            <div className={styles["featured-products"]}>
            <hr />
                <p>Lates items:</p>
                <div key="latest-items" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

                    {latestItems.map(item =>

                        <CatalogCard categoriId={item.category} item={item} />
                    )}

                </div>
                <br />
                <br />
                <hr />
                <p>Top rated items</p>
                <div key="top-items" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

                    {finalItemsa.map(item =>

                        <CatalogCard categoriId={item.category} item={item} />
                    )}

                </div>
            </div>


            <div className="overflow-hidden w-full bg-none-100 py-4">
                <hr />

                <p>Our satisfied clients:</p>

                <div className="overflow-hidden w-full bg-none-100 py-4">
                    <motion.div
                        className="flex space-x-6"
                        initial={{ x: "0%" }}
                        animate={{ x: "-100%" }}
                        transition={{ repeat: Infinity, duration: 30, ease: "linear" }} // Slow, smooth scrolling
                    >
                        {topReviews.concat(topReviews).map((comment, index) => ( // Duplicate for seamless loop
                            <div
                                key={comment._id} // Fix key reference
                                className="min-w-[300px] p-6 rounded-lg shadow-lg bg-white"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {comment.user} {/* Fix reference */}
                                        </h3>
                                        <div className="flex space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i} // Fix key inside the rating loop
                                                    className={`text-2xl ${i < comment.rating
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                        }`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-gray-600">
                                    {comment.review}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </div>

            </div>

        </section>
    )
}