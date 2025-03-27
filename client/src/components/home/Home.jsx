import { useLatestUploads, useTopRatingUploads } from "../../api/itemApi"
import CatalogCard from "../catalog/CatalogCard"
import styles from "./Home.module.css"
import { data, Link } from "react-router"

export default function Home() {
    const { latestItems } = useLatestUploads()
    const { topRatingtItems } = useTopRatingUploads()

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

    const finalItemsa = items.sort((a, b)=> Number(b.rating)-Number(a.rating)).slice(0, 4);
    console.log(finalItemsa);
    





    return (
        <section className={styles["main-section"]}>
            <div className={styles.welcome}>
                <h1>Music World</h1>
                <p>Best place for all music lover</p>
            </div>
            <div className={styles.buttons}>
                <div className={styles.browse}>
                    <span htmlFor="">Browse all categories</span>
                    <Link to="/categories">Browse</Link>
                </div>
                <div className={styles.login}>
                    <span htmlFor="">Don't have accound?</span>
                    <Link to="/register">Register</Link>
                </div>
                <div className={styles.register}>
                    <span htmlFor="">Already have accound?</span>
                    <Link to="/login">Login</Link>
                </div>
            </div>
            <hr />
            <div className={styles["featured-products"]}>
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
        </section>
    )
}