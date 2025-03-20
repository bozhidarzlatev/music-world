import { useContext } from "react"
import styles from "./Header.module.css"
import { Link } from "react-router"
import { UserContext } from "../../contexts/UserContext"

export default function Header() {
    const { email } = useContext(UserContext)

    return (
        <header>
            <div className={styles.main}>
                <Link to="/">
                    <img src="/logo.svg" alt="Music World Logo" />
                </Link>
                <p>Music World</p>
            </div>
            <nav>
                <Link to="/categories">Browse all</Link>

                {email ? (
                <div className={styles.user}>
                    <span>Weclome, {email}</span>
                    <Link to="/create">Add</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/logout">Logout</Link>
                </div>)
                : (<div className={styles.guest}>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>)
                }

            </nav>
        </header>
    )
}