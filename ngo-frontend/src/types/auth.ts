export interface User {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  access?: string;
  refresh?: string;
  token?: string;
}