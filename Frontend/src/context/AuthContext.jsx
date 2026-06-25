import { createContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // -------------------------------
  // Restore Session
  // -------------------------------
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const res = await authService.getMe();

      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);

      setUser(null);
      setIsAuthenticated(false);

      sessionStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Login
  // -------------------------------
  const login = async (credentials) => {
    const res = await authService.login(credentials);

    const { accessToken, user } = res.data;

    sessionStorage.setItem("accessToken", accessToken);

    setUser(user);
    setIsAuthenticated(true);

    return user; // ✅ Return only the user object
  };

  // -------------------------------
  // Signup
  // -------------------------------
  const signup = async (data) => {
    return await authService.signup(data);
  };

  // -------------------------------
  // Logout
  // -------------------------------
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      sessionStorage.removeItem("accessToken");

      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    restoreSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;