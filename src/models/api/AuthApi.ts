/**
 * Authentication API Response Models
 * Based on actual API responses from /auth/* endpoints
 */

export interface LoginApiResponse {
  message: string;
  access_token: string;
  user?: UserApiResponse;
}

export interface RegisterApiResponse {
  message: string;
  access_token: string;
  user?: UserApiResponse;
}

export interface UserApiResponse {
  id: number;
  firstname: string | null;
  lastname: string | null;
  fullname: string | null;
  username: string | null;
  dob: string | null;
  gender: string | null;
  email: string;
  pharmacy_id: number | null;
  pharmacy_branch_id: number | null;
  phone_number: string;
  status: string | null;
  member_id: string;
  address: string | null;
  image: string | null;
  profile_picture: string | null;
  profile_picture_full: string | null;
  saved_money: number;
  created_at?: string;
  updated_at?: string;
}

export interface OtpResponse {
  message: string;
}

export interface ProfilePictureResponse {
  message: string;
  profile_picture: string;
}

