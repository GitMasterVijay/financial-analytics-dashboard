export type UserRole = 'analyst';

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: {
    email: string;
    role: UserRole;
  };
}

export interface MeResponseData {
  email: string;
  role: UserRole;
}
