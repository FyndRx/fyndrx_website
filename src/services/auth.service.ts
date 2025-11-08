import type { User } from '@/models/User';
import usersData from '@/data/users.json';

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

const mockUsers = usersData as any[];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_CREDENTIALS = {
  email: 'john.mensah@example.com',
  phone: '+233245551234',
  password: 'password123'
};

class AuthService {
  private currentUser: any = null;

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await delay(800);
    
    const normalizedLogin = credentials.login.toLowerCase().replace(/\s/g, '');
    const normalizedEmail = MOCK_CREDENTIALS.email.toLowerCase();
    const normalizedPhone = MOCK_CREDENTIALS.phone.replace(/\s/g, '');
    
    if (
      (normalizedLogin === normalizedEmail || normalizedLogin === normalizedPhone) && 
      credentials.password === MOCK_CREDENTIALS.password
    ) {
      this.currentUser = mockUsers[0];
      const mockToken = 'mock_token_' + Date.now();
      
      return {
        message: 'Login successful',
        access_token: mockToken
      };
    }
    
    throw new Error('Invalid credentials. Use email: john.mensah@example.com, password: password123');
  }

  async getUserDetails(): Promise<User> {
    await delay(300);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    if (!this.currentUser) {
      this.currentUser = mockUsers[0];
    }
    
    return this.currentUser;
  }

  async register(credentials: RegisterCredentials): Promise<{ message: string }> {
    await delay(1000);
    
    const existingUser = mockUsers.find(
      u => u.email === credentials.email || (u as any).phone === credentials.phoneNumber
    );
    
    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }
    
    const newUser: any = {
      id: mockUsers.length + 1,
      firstname: credentials.firstName,
      lastname: credentials.lastName,
      email: credentials.email,
      phone: credentials.phoneNumber,
      profile_picture: null,
      profile_picture_full: null,
      role: credentials.role || 'patient',
      created_at: new Date().toISOString(),
      address: null
    };
    
    mockUsers.push(newUser);
    
    return {
      message: 'Registration successful. Please verify your email.'
    };
  }

  async verifyOTP(credentials: VerifyOTPCredentials): Promise<LoginResponse> {
    await delay(500);
    
    if (credentials.otp === '123456') {
      const user = mockUsers.find(u => u.email === credentials.email);
      if (user) {
        this.currentUser = user;
        const mockToken = 'mock_token_' + Date.now();
        
        return {
          message: 'OTP verified successfully',
          access_token: mockToken
        };
      }
    }
    
    throw new Error('Invalid OTP. Use 123456 for testing.');
  }

  async resendOTP(email: string): Promise<{ message: string }> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      message: 'OTP resent successfully. Use 123456 for testing.'
    };
  }

  async forgotPassword(credentials: ForgotPasswordCredentials): Promise<{ message: string }> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      message: 'Password reset link sent to your email'
    };
  }

  async resetPassword(_credentials: ResetPasswordCredentials): Promise<{ message: string }> {
    await delay(500);
    
    return {
      message: 'Password reset successfully'
    };
  }

  async logout(): Promise<void> {
    await delay(300);
    this.currentUser = null;
    localStorage.removeItem('access_token');
  }
}

export const authService = new AuthService();
