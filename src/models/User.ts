export type User = {
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
