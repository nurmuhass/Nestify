import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const initializeAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } else {
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setInitialized(true);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const signUp = async (form) => {
    try {
      const response = await fetch("https://insighthub.com.ng/NestifyAPI/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await response.json();

      if (response.ok && json.status === "success") {
        const { token, user } = json;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        setToken(token);
        setUser(user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        const msg = json.msg || "Registration failed";
        console.error("Registration error:", msg);
        return { error: msg };
      }
    } catch (error) {
      console.error("signUp error:", error);
      return { error: error.message || "Registration error" };
    }
  };

  const signIn = async ({ emailOrPhone, password }) => {
    try {
      const response = await fetch("https://insighthub.com.ng/NestifyAPI/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const json = await response.json();

      if (response.ok && json.status === "success") {
        const { token, user } = json;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        setToken(token);
        setUser(user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        const msg = json.msg || "Login failed";
        return { error: msg };
      }
    } catch (error) {
      console.error("signIn error:", error);
      return { error: error.message || "Login error" };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      return { success: true };
    } catch (error) {
      console.error("signOut error:", error);
      return { error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        initialized,
        user,
        token,
        signUp,
        signIn,
        signOut,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
