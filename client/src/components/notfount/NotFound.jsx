import { Link } from "react-router";

export default function NotFound(){
    return (
        <div className="text-center min-h-screen">

        <img src="/images/404.png" alt="Missing Note" className="mx-auto mt-4 w-100 h-100 object-cover" />
        <Link to="/" className="mt-6 inline-block px-8 py-4 bg-black text-white text-lg rounded-lg shadow hover:bg-gray-900 transition">Go Back Home</Link>
    </div>
    )
}
