import styles from "./Home.module.css"
import { Link } from "react-router"

export default function Home() {
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
                <div className={styles["products"]}>
                    <Link className={styles["top-rated"]} to={`/categories/category/id/details`}>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI-LcNlicYGdnG4wZYXQYiMRm7J6GD9tfd4Q&s" />
                        <p>Rating</p>
                        <p>Product 1</p>
                        <p>Category</p>
                        <p>Price</p>
                    </Link>



                </div>
                <hr />
                <div className={styles["products"]}>
                <Link className={styles["recently-added"]} to={`/categories/category/id/details`}>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI-LcNlicYGdnG4wZYXQYiMRm7J6GD9tfd4Q&s" />
                        <p>Rating</p>
                        <p>Product 1</p>
                        <p>Category</p>
                        <p>Price</p>
                    </Link>                  
                    <Link className={styles["recently-added"]} to={`/categories/category/id/details`}>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI-LcNlicYGdnG4wZYXQYiMRm7J6GD9tfd4Q&s" />
                        <p>Rating</p>
                        <p>Product 1</p>
                        <p>Category</p>
                        <p>Price</p>
                    </Link>
                </div>
            </div>
        </section>
    )
}