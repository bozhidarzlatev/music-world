import { useActionState, useState } from "react";
import { useRegister } from "../../../api/authApi";
import { useNavigate } from "react-router";
import { useUserContext } from "../../../contexts/UserContext";
import { useCreateCart } from "../../../api/cartApi";

export default function Register() {
  const { register } = useRegister();
  const { userDateHandler, accessToken } = useUserContext();
  const { create } = useCreateCart()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    rePassword: "",
    avatar: ""
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    let error = "";

    if (name === "firstName" && value.length < 5) {
      error = "First name must be at least 5 characters.";
    }
    if (name === "lastName" && value.length < 5) {
      error = "Last name must be at least 5 characters.";
    }

    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
      error = "Invalid email format. - jon@doe.com";
    }

    if (name === "password" && value.length < 6) {
      error = "Password must be at least 6 characters.";
    }

    if (name === "rePassword" && value !== formData.password) {
      error = "Passwords do not match.";
    }

    if (name === "avatar" && !/^https?:\/\/.+/i.test(value)) {
      error = "Avatar URL must start with http:// or https://";
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    validate(name, value);
  };

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));

  };

  const isFormValid = Object.values(errors).every((err) => err === "") &&
    Object.values(formData).every((val) => val.trim() !== "");

  const registerHandler = async (val, formData) => {
    const regData = Object.fromEntries(formData)

    const rePassword = formData.get('rePassword');


    const userData = await register(regData)
    const regUserData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      _id: userData._id,
      avatar: userData.avatar,
      accessToken: userData.accessToken
    }

    userDateHandler(regUserData)
    const createCart = create(userData.accessToken)
    navigate('/')

  }



  const [state, regAction, isPending] = useActionState(registerHandler, { firstName: '', lastName: '', email: '', password: '', rePassword: '', avatar: '' });


  return (

    <div className="min-h-screen m-10 flex items-center justify-center  px-6">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>

        <form className="space-y-5" action={regAction}>
          <div>
            <label htmlFor="name" className="block font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              min={5}
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your first name"
              className={`mt-2 w-full p-3 border-2 
                ${touched.firstName 
                  ? (errors.firstName || !formData.firstName) 
                    ? "border-red-500"   
                    : "border-green-500" 
                  : "border-gray-300"   
                }  
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
          {(touched.firstName && errors.firstName) || (touched.firstName && !formData.firstName)
              ? <p className="text-red-500">{errors.firstName || "Please fill first name"}</p>
              : null
            }
          </div>


          <div>
            <label htmlFor="lastName" className="block font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your last name"
              className={`mt-2 w-full p-3 border-2 
                ${touched.lastName 
                  ? (errors.lastName || !formData.lastName) 
                    ? "border-red-500"   
                    : "border-green-500" 
                  : "border-gray-300"   
                }  
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
          {(touched.lastName && errors.lastName) || (touched.lastName && !formData.lastName)
              ? <p className="text-red-500">{errors.lastName || "Please fill last name"}</p>
              : null
            }
          </div>

          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className={`mt-2 w-full p-3 border-2 
                ${touched.email 
                  ? (errors.email || !formData.email) 
                    ? "border-red-500"   
                    : "border-green-500" 
                  : "border-gray-300"   
                }  
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
          {(touched.email && errors.email) || (touched.email && !formData.email)
              ? <p className="text-red-500">{errors.email || "Please fill email"}</p>
              : null
            }
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className={`mt-2 w-full p-3 border-2 
                ${touched.password 
                  ? (errors.password || !formData.password) 
                    ? "border-red-500"   
                    : "border-green-500" 
                  : "border-gray-300"   
                }  
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}            />
            {(touched.password && errors.password) || (touched.password && !formData.password)
              ? <p className="text-red-500">{errors.password || "Please fill password"}</p>
              : null
            }           
             {touched.rePassword && errors.rePassword && <p className="text-red-500">{errors.rePassword}</p>}
          </div>


          <div>
            <label htmlFor="confirm-password" className="block font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="rePassword"
              name="rePassword"
              value={formData.rePassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Re-enter your password"
              className={`mt-2 w-full p-3 border-2 
                ${touched.rePassword 
                  ? (errors.rePassword || !formData.rePassword) 
                    ? "border-red-500"   
                    : "border-green-500" 
                  : "border-gray-300"   
                }  
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}            />
            {touched.rePassword && errors.rePassword && <p className="text-red-500">{errors.rePassword}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-gray-700">Avatar Imgae</label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Place image url"
              className={`mt-2 w-full p-3 border-2 
                ${touched.avatar 
                  ? (errors.avatar || !formData.avatar) 
                    ? "border-red-500"  
                    : "border-green-500"
                  : "border-gray-300"   
                }  
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}            />
            {touched.avatar && errors.avatar && <p className="text-red-500">{errors.avatar}</p>}
            {touched.avatar && !formData.avatar && <p className="text-red-500">Please fill the field</p>}

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
            Register
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 font-medium hover:underline ">
            Log in
          </a>
        </p>
      </div>
    </div>


  )
}