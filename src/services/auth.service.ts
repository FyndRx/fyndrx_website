import { apiService } from './api';
import type { User } from '@/models/User';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface ResetPasswordCredentials {
  access_token: string;
  password: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface VerifyOTPCredentials {
  email: string;
  otp: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
}

export interface UserDetailsResponse {
  user: User;
}

class AuthService {
  private readonly BASE_URL = '/auth';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiService.post<LoginResponse>(`${this.BASE_URL}/login`, credentials);
  }

  async getUserDetails(): Promise<User> {
    return apiService.getAuth<User>('/user/details/get');
  }

  async register(credentials: RegisterCredentials): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`${this.BASE_URL}/register`, credentials);
  }

  async verifyOTP(credentials: VerifyOTPCredentials): Promise<LoginResponse> {
    return apiService.post<LoginResponse>(`${this.BASE_URL}/verify-otp`, credentials);
  }

  async resendOTP(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`${this.BASE_URL}/resend-otp`, { email });
  }

  async forgotPassword(credentials: ForgotPasswordCredentials): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`${this.BASE_URL}/forgot-password`, credentials);
  }

  async resetPassword(credentials: ResetPasswordCredentials): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`${this.BASE_URL}/reset-password`, credentials);
  }

  async logout(): Promise<void> {
    try {
      await apiService.postAuth('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
    }
  }
}

export const authService = new AuthService();
