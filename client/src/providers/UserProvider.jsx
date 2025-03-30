import { UserContext } from "../contexts/UserContext";
import useAuth from "../hooks/useAuth";
import usePersistedState from "../hooks/usePersistedState";

export default function UserProvider({
  children
}) {
  const { userId } = useAuth()
  const [userData, setUserData] = usePersistedState('authMusicWorld', {})
  
  const userDateHandler = (data) => {

    setUserData(data);
  };

  return (
    <UserContext.Provider value={{ ...userData,  userDateHandler }}>
      {children}
    </UserContext.Provider>
  )
}