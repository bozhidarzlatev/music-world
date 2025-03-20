import { useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import request from "../utils/request";

const baseUrl = 'http://localhost:3030/users';

export const useLogin = () => {
    const login = async (email, password) =>
        request.post(
            `${baseUrl}/login`,
            { email, password },
        );

    return {
        login
    }
}

export const useRegister = () => {
    const register = (regData ) => 
        request.post(
            `${baseUrl}/register`,
             { ...regData }
            );
   


    return {
        register
    }
}

export const useLogout = () => {
    const { accessToken, userDateHandler } = useContext(UserContext);
    
    useEffect(() => {
        if (!accessToken) {
            return;
        }

        const options = {
            headers: {
                'X-Authorization': accessToken,
            }
        };

        request.get(`${baseUrl}/logout`, null, options)
            .then(userDateHandler({}));

    }, [accessToken, userDateHandler]);

    return {
        isLoggedOut: !!accessToken,
    };
};