import { useActionState, useState } from "react";
import { useLogin } from "../../../api/authApi";
import { useNavigate } from "react-router";
import { useUserContext } from "../../../contexts/UserContext";
import { useToastContext } from "../../../contexts/ToastContext";

export default function Login() {
  const { login } = useLogin()
  const navigate = useNavigate()
  const { userDateHandler } = useUserContext()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const { addToast, showToast } = useToastContext()


  const validate = (name, value) => {
    let error = "";
    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
      error = "Invalid email format. - jon@doe.com";
    }


    if (name === "password" && value.length < 5) {
      error = "Password must be at least 5 characters.";
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  }


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    validate(name, value);
  }

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }))
  }

  const isFormValid = Object.values(errors).every((err) => err === "") &&
    Object.values(formData).every((val) => val.trim() !== "");

  const loginHandler = async (_, formData) => {
    const userData = Object.fromEntries(formData)


    try {
      const authData = await login(userData.email, userData.password)
      addToast({ code: 200, message: 'Login successfully!' });
      showToast()
      if (authData.code === 403) {
        addToast({ code: authData.code, message: authData.message });
        showToast()
        throw new Error(authData.message);
      }

      const logUserData = {
        firstName: authData.firstName,
        lastName: authData.lastName,
        email: authData.email,
        _id: authData._id,
        avatar: authData.avatar,
        accessToken: authData.accessToken
      }

      userDateHandler(logUserData)
      navigate('/')

    } catch (error) {
      console.log(error);

    }





  }

  const [_, loginAction, isPending] = useActionState(loginHandler, { email: '', password: '' })

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100 px-6">

      <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-3xl font-semibold text-center mb-8">Login</h2>
        <form className="space-y-6" action={loginAction}>
          <div className="space-y-4">
            <input
              type="email"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              value={formData.firstName}
              placeholder="Email"
              className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(touched.email && errors.email) || (touched.email && !formData.email)
              ? <p className="text-red-500">{errors.email || "Please fill email"}</p>
              : null
            }

            <input
              type="password"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(touched.password && errors.password) || (touched.password && !formData.password)
              ? <p className="text-red-500">{errors.password || "Please fill password"}</p>
              : null
            }
          </div>
          <button
            type="submit"
            className={`w-full py-3 font-semibold rounded-lg transition duration-300 
              ${!isFormValid || isPending
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }  `}
            disabled={!isFormValid || isPending}
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