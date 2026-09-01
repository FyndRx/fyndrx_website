import type { User, Address, MedicalRecord } from '@/models/User';
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
import type { ApiError } from '@/utils/errorHandler';

export type SocialProvider = 'google' | 'facebook';

export interface LinkRequiredResponse {
  requires_password_confirmation: true;
  provider: SocialProvider;
  email: string;
  message: string;
}

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
  /** Set when this OTP is for the forgot-password flow — lets the backend look the
   *  user up first and no-op (still 200) if no account matches, without revealing
   *  whether the phone/email is registered. */
  reset_password?: boolean;
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
  email?: string;
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
   * Reset password (OTP flow)
   * @param credentials - Phone number, OTP, and new password
   * @returns Success message
   */
  async resetPassword(credentials: ResetPasswordCredentials): Promise<{ message: string }> {
    return await apiService.post<OtpResponse>('/auth/password-reset', credentials);
  }

  /**
   * Request a password reset email link.
   * Backend: POST /auth/forgot-password { email }
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/auth/forgot-password', { email });
  }

  /**
   * Complete a token-based password reset (from email link).
   * Backend: POST /auth/reset-password { token, email, password, password_confirmation }
   */
  async resetPasswordWithToken(
    token: string,
    email: string,
    password: string,
    password_confirmation: string
  ): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation,
    });
  }

  /**
   * Change (or, for a social-only account with no password yet, set for the first
   * time) the authenticated user's password. `current_password` is only required
   * when the account already has one — check `user.has_password` before deciding
   * whether to render that field. On success, every other active session (every
   * refresh-token family besides the one making this request) is revoked
   * server-side; the caller's own session stays signed in.
   */
  async changePassword(data: { current_password?: string; new_password: string; new_password_confirmation: string }): Promise<{ message: string }> {
    return await apiService.postAuth<{ message: string }>('/auth/change-password', data);
  }

  /**
   * Send a verification code to the authenticated user's own email address, to
   * confirm it if it was left unverified at signup.
   */
  async sendEmailVerificationOtp(): Promise<{ message: string }> {
    return await apiService.postAuth<{ message: string }>('/auth/verify-email/send');
  }

  /**
   * Confirm the code sent by sendEmailVerificationOtp.
   */
  async confirmEmailVerification(otp: string): Promise<{ message: string }> {
    return await apiService.postAuth<{ message: string }>('/auth/verify-email/confirm', { otp });
  }

  /**
   * Send a verification code to the authenticated user's own phone number, to
   * confirm it if it was left unverified at signup.
   */
  async sendPhoneVerificationOtp(): Promise<{ message: string }> {
    return await apiService.postAuth<{ message: string }>('/auth/verify-phone/send');
  }

  /**
   * Confirm the code sent by sendPhoneVerificationOtp.
   */
  async confirmPhoneVerification(otp: string): Promise<{ message: string }> {
    return await apiService.postAuth<{ message: string }>('/auth/verify-phone/confirm', { otp });
  }

  /**
   * Unlink a social provider from the authenticated account. The backend blocks
   * this (422) if it would leave the account with no password and no other linked
   * provider — set a password first in that case.
   */
  async unlinkProvider(provider: SocialProvider): Promise<{ message: string }> {
    return await apiService.postAuth<{ message: string }>(`/auth/unlink/${provider}`);
  }

  /**
   * Sign in or sign up with a Google/Facebook token obtained client-side via the
   * provider's own SDK. Resolves to a LinkRequiredResponse (rather than throwing)
   * when the email already belongs to a password account that needs confirming.
   */
  async loginWithProvider(provider: SocialProvider, token: string): Promise<LoginResponse | LinkRequiredResponse> {
    const payload = provider === 'google' ? { id_token: token } : { access_token: token };
    try {
      const response = await apiService.post<LoginApiResponse>(`/auth/${provider}`, payload);
      return { message: response.message, access_token: response.access_token };
    } catch (err) {
      // apiService's response interceptor already transforms axios errors into the
      // ApiError shape below (see src/services/api.ts) before they reach here — the
      // raw response body survives on `.data` specifically so cases like this, where
      // the error payload carries structured data beyond message/code, aren't lost.
      const apiError = err as ApiError;
      const data = apiError?.data as { requires_password_confirmation?: boolean } | undefined;
      if (apiError?.status === 409 && data?.requires_password_confirmation) {
        return data as LinkRequiredResponse;
      }
      throw err;
    }
  }

  /**
   * Confirms linking a social identity to an existing password account.
   */
  async confirmProviderLink(provider: SocialProvider, token: string, password: string): Promise<LoginResponse> {
    const payload = provider === 'google'
      ? { id_token: token, password }
      : { access_token: token, password };
    const response = await apiService.post<LoginApiResponse>(`/auth/${provider}/link`, payload);
    return { message: response.message, access_token: response.access_token };
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

  async getAddresses(): Promise<Address[]> {
    const response = await apiService.getAuth<{ data: Address[] }>('/user/addresses');
    return response.data;
  }

  async addAddress(data: Partial<Omit<Address, 'id'>>): Promise<Address> {
    const response = await apiService.postAuth<{ data: Address }>('/user/addresses', data);
    return response.data;
  }

  async updateAddress(id: number, data: Partial<Address>): Promise<Address> {
    const response = await apiService.putAuth<{ data: Address }>(`/user/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: number): Promise<void> {
    await apiService.deleteAuth<void>(`/user/addresses/${id}`);
  }

  async setDefaultAddress(id: number): Promise<void> {
    await apiService.postAuth<void>(`/user/addresses/${id}/set-default`);
  }

  // ── Medical Record Management ───────────────────────────────────────────

  async getMedicalRecords(): Promise<MedicalRecord[]> {
    const response = await apiService.getAuth<{ data: MedicalRecord[] }>('/user/medical-records');
    return response.data;
  }

  async addMedicalRecord(data: Omit<MedicalRecord, 'id' | 'created_at'>): Promise<MedicalRecord> {
    const response = await apiService.postAuth<{ data: MedicalRecord }>('/user/medical-records', data);
    return response.data;
  }

  async updateMedicalRecord(id: number, data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const response = await apiService.putAuth<{ data: MedicalRecord }>(`/user/medical-records/${id}`, data);
    return response.data;
  }

  async deleteMedicalRecord(id: number): Promise<void> {
    await apiService.deleteAuth<void>(`/user/medical-records/${id}`);
  }
}

export const authService = new AuthService();
