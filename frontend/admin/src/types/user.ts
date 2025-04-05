export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  photoURL?: string;
  avatar?: string | null;
  permissions?: Array<string>;
  role?: Array<string>;
}

export type IUser = User;