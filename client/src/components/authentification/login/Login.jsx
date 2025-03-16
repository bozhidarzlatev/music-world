export default function Login(){
    return (
        <div className="h-screen flex justify-center items-center bg-gray-100 px-6">
        <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-lg">
          <h2 className="text-3xl font-semibold text-center mb-8">Login</h2>
          <form className="space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-lg font-medium"
            >
              Login
            </button>
          </form>
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
      );
}