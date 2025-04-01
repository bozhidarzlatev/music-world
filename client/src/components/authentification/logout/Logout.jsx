import { Navigate } from "react-router";
import { useLogout } from "../../../api/authApi";
import { useToastContext } from "../../../contexts/ToastContext";
import Spinner from "../../spinner/Spinner";

export default function Logout() {
    const { isLoggedOut } = useLogout()
    const {addToast, showToast} = useToastContext()

    addToast({code: 200, message: 'Logout succsesfully!'});
    showToast()
    return isLoggedOut
        ? <Navigate to="/" />
        : <Spinner />;
}
