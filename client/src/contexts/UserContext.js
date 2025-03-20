import { createContext } from "react";


export const UserContext = createContext({
        email: '',
        firstName: '',
        lastName: '',
        avatar: '',
        _id: '',
        accessToken: '',
        userDateHandler: () => null,
})