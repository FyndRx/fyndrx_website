export type User = {
  id: string;
  firstname: string | null;
  lastname: string | null;
  fullname: string | null;
  username: string | null;
  dob: string | null;
  gender: string | null;
  email: string;
  pharmacy_id: string | null;
  pharmacy_branch_id: string | null;
  phone_number: string;
  status: string | null;
  member_id: string;
  address: string | null;
  image: string | null;
  profile_picture: string | null;
  profile_picture_full: string | null;
  saved_money: number;
  addresses?: Address[];
  medical_records?: MedicalRecord[];
  created_at?: string;
  updated_at?: string;
};

export type Address = {
  id: number;
  label: string | null;
  google_address: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  latitude: number | null;
  longitude: number | null;
};

export type MedicalRecord = {
  id: number;
  category: string;
  item_name: string;
  notes: string | null;
  status: string;
  date_identified: string | null;
  created_at: string;
};

export type UserCredentials = {
  email: string;
  password: string;
};

export type UserProfile = {
  firstname?: string;
  lastname?: string;
  username?: string;
  dob?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
  profile_picture?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ProfileResponse = {
  profile: UserProfile;
};
