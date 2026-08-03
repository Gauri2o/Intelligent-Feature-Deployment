import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";


const AuthContext = createContext();



export function AuthProvider({ children }) {


  const [token, setToken] = useState(
    localStorage.getItem("token")
  );


  const [user, setUser] = useState(null);


  const [loading, setLoading] = useState(false);



  useEffect(() => {

    const checkUser = async () => {


      if (!token) {

        setLoading(false);
        return;

      }


      setLoading(true);


      try {

        const response = await api.get(
          "/auth/me"
        );


        setUser(
          response.data
        );


      } catch (error) {


        console.log(
          "Auth check failed",
          error
        );


        localStorage.removeItem(
          "token"
        );


        setToken(null);

        setUser(null);


      } finally {


        setLoading(false);


      }


    };


    checkUser();


  }, [token]);





  const login = (accessToken) => {


    localStorage.setItem(
      "token",
      accessToken
    );


    setToken(accessToken);


  };





  const logout = () => {


    localStorage.removeItem(
      "token"
    );


    setToken(null);

    setUser(null);


  };





  return (

    <AuthContext.Provider

      value={{

        token,

        user,

        loading,

        login,

        logout,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}





export function useAuth(){

  return useContext(AuthContext);

}