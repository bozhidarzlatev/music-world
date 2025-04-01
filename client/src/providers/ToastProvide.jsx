import { useState } from "react";
import { ToastContext } from "../contexts/ToastContext";

export const ToastProvider = ({
    children
}) => {
    const [toast, setToast] = useState({});
    const [viewToast, setViewToast] = useState(false)

    const addToast = (data) => {
        setToast(prev => prev = data)
    }

    const showToast = () => {
        setViewToast(true)
    }

    const hideToast = () => {
        setViewToast(false)
    }


    return (
        <ToastContext.Provider value={{ toast, addToast, viewToast,  showToast, hideToast }}>
            {children}
        </ToastContext.Provider>

    );
}