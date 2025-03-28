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


  const registerHandler = async (_, formData) => {
    const regData = Object.fromEntries(formData)

    const rePassword = formData.get('rePassword');


    const userData =  await register(regData)
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



  const [_, regAction, isPending] = useActionState(registerHandler, {  firstName: '', lastName: '', email: '', password: '' , rePassword: '', avatar: '' });


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
              placeholder="Enter your full name"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              
            />
          </div>


          <div>
            <label htmlFor="lastName" className="block font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Enter your last name"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>


          <div>
            <label htmlFor="confirm-password" className="block font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="rePassword"
              name="rePassword"
              placeholder="Re-enter your password"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-gray-700">Avatar Imgae</label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              placeholder="Place image url"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
            disabled={isPending}
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