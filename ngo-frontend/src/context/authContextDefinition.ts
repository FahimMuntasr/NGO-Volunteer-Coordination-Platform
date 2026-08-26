import { createContext } from "react";

import type { User } from "../types/auth";

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);