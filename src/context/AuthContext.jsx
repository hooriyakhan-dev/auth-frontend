import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if a saved token is still valid
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);
    api
      .get("/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (name, email, password) =>
    saveSession((await api.post("/register", { name, email, password })).data);

  const login = async (email, password) =>
    saveSession((await api.post("/login", { email, password })).data);

  const updateName = async (name) => setUser((await api.put("/me", { name })).data.user);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}
