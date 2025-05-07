export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "provider" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: "patient" | "provider" | "admin";
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "provider" | "admin";
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserResponse {
  user: User;
}

export interface ProfileResponse {
  profile: UserProfile;
}
