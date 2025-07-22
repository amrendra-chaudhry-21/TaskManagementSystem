import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const storedUserInfo = localStorage.getItem("userInfo");

    if (token && userId && storedUserInfo) {
      setIsAuthenticated(true);
      const userData = JSON.parse(storedUserInfo);
      setUserInfo(userData);
    } else {
      setIsAuthenticated(false);
      setUserInfo(null);
    }
    setIsLoading(false);
  };

  const login = (
    accessToken,
    refreshToken,
    userId,
    name,
    email,
    teams = []
  ) => {
    const userInfo = {
      id: userId,
      name: name || "User",
      email: email || "amrendra@gmail.com",
      teams: teams,
    };

    console.log("first", userInfo);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    localStorage.setItem("isAuthenticated", "true");

    setIsAuthenticated(true);
    setUserInfo(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userInfo");
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
        userInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
