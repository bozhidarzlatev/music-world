import { createContext, useContext } from "react";


export const UserContext = createContext({
        email: '',
        firstName: '',
        lastName: '',
        avatar: '',
        _id: '',
        accessToken: '',
        userDateHandler: () => null,
})

export function useUserContext() {
        const data = useContext(UserContext);

        return data
}