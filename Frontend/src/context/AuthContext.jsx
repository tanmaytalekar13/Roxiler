import { createContext, useState, useEffect } from "react";
import { refreshToken, getMe, setAccessToken } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until rehydration attempt completes

  // On mount: try to get a fresh accessToken via the HttpOnly refresh cookie,
  // then load the user profile. If either fails, user stays null (not logged in).
  useEffect(() => {
    (async () => {
      try {
        const refreshRes = await refreshToken();
        const token = refreshRes.data.data.accessToken;
        setAccessToken(token);

        const meRes = await getMe();
        setUser(meRes.data.data);
      } catch (_) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}