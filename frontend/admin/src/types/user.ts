export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
  photoURL?: string;
  permissions?: Array<string>;
}

export type IUser = User;
