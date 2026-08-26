import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginApi,
  logoutAccount,
} from "../api/auth";

import type {
  User,
} from "../types/auth";

import {
  AuthContext,
  type AuthContextType,
} from "./authContextDefinition";


type AuthProviderProps = {
  children: ReactNode;
};


export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  useEffect(() => {

    async function restoreAuthentication() {

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setLoading(false);
        return;
      }

      try {

        const currentUser =
          await getCurrentUser();

        setUser(
          currentUser
        );

      } catch {

        localStorage.removeItem(
          "token"
        );

        setUser(
          null
        );

      } finally {

        setLoading(
          false
        );
      }
    }


    restoreAuthentication();

  }, []);


  async function login(
    username: string,
    password: string,
  ) {

    const data =
      await loginApi(
        username,
        password,
      );

    localStorage.setItem(
      "token",
      data.token,
    );

    setUser(
      data.user
    );
  }


  function logout() {

    const token =
      localStorage.getItem(
        "token"
      );

    /*
     * Tell Django to invalidate
     * the token.
     *
     * We do not prevent local logout
     * if the server request fails.
     */
    if (token) {

      logoutAccount(token)
        .catch((error) => {
          console.error(
            "Server logout failed:",
            error,
          );
        });
    }


    // Immediately clear the browser session.
    localStorage.removeItem(
      "token"
    );

    setUser(
      null
    );
  }


  const value:
  AuthContextType = {

    user,

    isAuthenticated:
      user !== null,

    loading,

    login,

    logout,
  };


  return (

    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>

  );
}