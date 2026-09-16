export interface User {
  fullname: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
}

export type UpdateUserTypes = Omit<
  User,
  'username' | 'password' | 'phoneNumber'
>;

export type UserLoginTypes = Omit<User, 'fullname' | 'phoneNumber'>;

export enum role {
  ADMIN = 'ADMIN',
  CATEROR = 'CATEROR',
}
