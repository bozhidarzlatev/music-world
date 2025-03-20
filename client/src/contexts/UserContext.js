import { createContext } from "react";


export const UserContext = createContext({
        email: '',
        username: 'Admin',
        _id: '',
        accessToken: '',
        userLoginHandler: () => null
})