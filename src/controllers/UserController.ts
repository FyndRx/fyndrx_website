import { apiService } from "@/services/api/apiService";
import type {
  User,
  UserCredentials,
  UserProfile,
  AuthResponse,
  ProfileResponse,
} from "@/models/User";

class UserController {
  private static instance: UserController;

  private constructor() {}

  public static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  async login(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      return response.data;
    } catch (error) {
      throw new Error("Login failed");
    }
  }

  async register(userData: UserCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        "/auth/register",
        userData
      );
      return response.data;
    } catch (error) {
      throw new Error("Registration failed");
    }
  }

  async updateProfile(
    profileData: Partial<UserProfile>
  ): Promise<ProfileResponse> {
    try {
      const response = await apiService.put<ProfileResponse>(
        "/users/profile",
        profileData
      );
      return response.data;
    } catch (error) {
      throw new Error("Profile update failed");
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await apiService.get<ProfileResponse>("/users/profile");
      return response.data.profile;
    } catch (error) {
      throw new Error("Failed to fetch user profile");
    }
  }
}

export const userController = UserController.getInstance();
