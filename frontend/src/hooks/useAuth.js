import { useEffect, useState } from "react";

export function useAuth() {
  const [token, setToken] = useState(() => window.localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = window.localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("token", token);
    } else {
      window.localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem("user", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("user");
    }
  }, [user]);

  const login = (newToken, userInfo) => {
    setToken(newToken);
    setUser(userInfo);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return { token, user, login, logout };
}

