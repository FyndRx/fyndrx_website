export type User = {
  id: number;
  firstname: string | null;
  lastname: string | null;
  fullname: string | null;
  username: string | null;
  dob: string | null;
  email: string;
  pharmacy_id: null;
  pharmacy_branch_id: null;
  phone_number: string;
  status: null;
  member_id: string;
  address: null;
  image: null;
  profile_picture: string | null;
  profile_picture_full: string | null;
  saved_money: number;
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
