import {jwtDecode, JwtPayload} from 'jwt-decode';
import {User} from '.';

export interface CustomJwtPayload extends Omit<JwtPayload, 'exp'> {
  caterorId: string;
  languageId?: string;
  email: string;
  fullname: string;
  id: string;
  role: string;
  username: string;
  GSTin?: string;
  plan?: string;
  phoneNumber?: string;
  address?: string;
  employeeRestriction?: {
    eventPage: boolean;
  };
  // Add any other custom claims your JWT might have
  exp: number; // Make exp required
  iat: number; // Make iat required
}

export const decodeToken = (token: string): CustomJwtPayload => {
  return jwtDecode<CustomJwtPayload>(token);
};

export const mapJwtToUser = (jwt: CustomJwtPayload): User => ({
  email: jwt.email,
  exp: jwt.exp || 0,
  fullname: jwt.fullname,
  iat: jwt.iat || 0,
  id: jwt.id,
  role: jwt.role,
  username: jwt.username,
  languageId: jwt.languageId,
  caterorId: jwt.caterorId,
  phoneNumber: jwt.phoneNumber || '',
  address: jwt.address || '',
  GSTin: jwt.GSTin || '',
  plan: jwt.plan || '',
  employeeRestriction: jwt.employeeRestriction || {eventPage: false},
});
