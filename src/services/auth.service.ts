import type { User } from '@/models/User';
import { apiService } from './api';
import type { 
  LoginApiResponse, 
  RegisterApiResponse,
  UserApiResponse,
  OtpResponse,
  ProfilePictureResponse,
  UserSession
} from '@/models/api';
import { unwrapApiResponse, transformUser } from '@/utils/responseTransformers';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterCredentials {
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  password: string;
  otp?: string;
}

export interface TestRegisterCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordCredentials {
  phone_number: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export interface SendOTPCredentials {
  phone_number?: string;
  email?: string;
}

export interface VerifyOTPCredentials {
  phone_number?: string;
  email?: string;
  otp: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
}

export interface UpdateUserDetailsRequest {
  firstname?: string;
  lastname?: string;
  dob?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
}

class AuthService {
  /**
   * Login user
   * @param credentials - Login credentials (email/phone and password)
   * @returns Login response with access token
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginApiResponse>('/auth/login', credentials);
    return {
      message: response.message,
      access_token: response.access_token,
    };
  }

  /**
   * Get current user details
   * @returns User object
   */
  async getUserDetails(): Promise<User> {
    const response = await apiService.getAuth<UserApiResponse | { data: UserApiResponse }>(
      '/user/details/get'
    );
    const apiUser = unwrapApiResponse(response);
    return transformUser(apiUser);
  }

  /**
   * Register new user
   * @param credentials - Registration credentials including OTP
   * @returns Login response with access token
   */
  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    const response = await apiService.post<RegisterApiResponse>('/auth/register', credentials);
    return {
      message: response.message,
      access_token: response.access_token,
    };
  }

  /**
   * Test registration (no OTP required)
   * @param credentials - Test registration credentials
   * @returns Login response with access token
   */
  async testRegister(credentials: TestRegisterCredentials): Promise<LoginResponse> {
    const response = await apiService.post<RegisterApiResponse>('/auth/test-signup', credentials);
    return {
      message: response.message,
      access_token: response.access_token,
    };
  }

  /**
   * Send OTP to phone number
   * @param credentials - Phone number
   * @returns Success message
   */
  async sendOTP(credentials: SendOTPCredentials): Promise<{ message: string }> {
    return await apiService.post<OtpResponse>('/auth/user-otp-send', credentials);
  }

  /**
   * Verify OTP
   * @param credentials - Phone number and OTP
   * @returns Success message
   */
  async verifyOTP(credentials: VerifyOTPCredentials): Promise<{ message: string }> {
    return await apiService.post<OtpResponse>('/auth/user-otp-verify', credentials);
  }

  /**
   * Reset password
   * @param credentials - Phone number, OTP, and new password
   * @returns Success message
   */
  async resetPassword(credentials: ResetPasswordCredentials): Promise<{ message: string }> {
    return await apiService.post<OtpResponse>('/auth/password-reset', credentials);
  }

  /**
   * Refresh access token
   * @returns Login response with new access token
   */
  async refresh(): Promise<LoginResponse> {
    const response = await apiService.post<LoginApiResponse>('/auth/refresh');
    return {
      message: response.message,
      access_token: response.access_token,
    };
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<UserSession[]> {
    const response = await apiService.getAuth<{ success: boolean; sessions: UserSession[] }>('/auth/sessions');
    return response.sessions;
  }

  /**
   * Revoke a specific session
   * @param sessionId - Session ID to revoke
   */
  async revokeSession(sessionId: number): Promise<void> {
    await apiService.postAuth<void>(`/auth/sessions/${sessionId}/revoke`);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiService.postAuth<void>('/auth/logout');
  }

  /**
   * Delete user account
   * @param credentials - Email, password, and deletion reason
   * @returns Success message
   */
  async deleteAccount(credentials: { 
    email: string; 
    password: string; 
    delete_reason: string 
  }): Promise<{ message: string }> {
    return await apiService.deleteAuth<OtpResponse>('/auth/delete-account', {
      data: credentials
    });
  }

  /**
   * Update user details
   * @param data - User details to update
   * @returns Updated user object
   */
  async updateUserDetails(data: UpdateUserDetailsRequest): Promise<User> {
    const response = await apiService.postAuth<UserApiResponse | { data: UserApiResponse }>(
      '/user/details/update', 
      data
    );
    const apiUser = unwrapApiResponse(response);
    return transformUser(apiUser);
  }

  /**
   * Upload profile picture
   * @param file - Image file
   * @returns Response with profile picture URL
   */
  async uploadProfilePicture(file: File): Promise<ProfilePictureResponse> {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return await apiService.postAuth<ProfilePictureResponse>(
      '/user/picture/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }

  /**
   * Update profile picture
   * @param file - Image file
   * @returns Response with profile picture URL
   */
  async updateProfilePicture(file: File): Promise<ProfilePictureResponse> {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return await apiService.postAuth<ProfilePictureResponse>(
      '/user/picture/update',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }

  // ── Address Management ──────────────────────────────────────────────────

  async getAddresses(): Promise<any[]> {
    const response = await apiService.getAuth<any>('/user/addresses');
    return response.data;
  }

  async addAddress(data: any): Promise<any> {
    const response = await apiService.postAuth<any>('/user/addresses', data);
    return response.data;
  }

  async updateAddress(id: number, data: any): Promise<any> {
    const response = await apiService.putAuth<any>(`/user/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: number): Promise<void> {
    await apiService.deleteAuth<void>(`/user/addresses/${id}`);
  }

  async setDefaultAddress(id: number): Promise<any> {
    const response = await apiService.postAuth<any>(`/user/addresses/${id}/set-default`);
    return response.data;
  }

  // ── Medical Record Management ───────────────────────────────────────────

  async getMedicalRecords(): Promise<any[]> {
    const response = await apiService.getAuth<any>('/user/medical-records');
    return response.data;
  }

  async addMedicalRecord(data: any): Promise<any> {
    const response = await apiService.postAuth<any>('/user/medical-records', data);
    return response.data;
  }

  async updateMedicalRecord(id: number, data: any): Promise<any> {
    const response = await apiService.putAuth<any>(`/user/medical-records/${id}`, data);
    return response.data;
  }

  async deleteMedicalRecord(id: number): Promise<void> {
    await apiService.deleteAuth<void>(`/user/medical-records/${id}`);
  }
}

export const authService = new AuthService();
