import { UserContext } from "../contexts/UserContext";
import usePersistedState from "../hooks/usePersistedState";

export default function UserProvider({
  children
}) {
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