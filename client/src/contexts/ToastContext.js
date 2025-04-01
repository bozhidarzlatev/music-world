import { createContext, useContext } from 'react';


export const ToastContext = createContext();


export function useToastContext () {
    const data = useContext(ToastContext)
    return data
}
