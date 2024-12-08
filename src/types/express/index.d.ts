import { UserRole } from '../../entities/User';

declare module 'express' {
  export interface Request {
    user?: IUser;
  }
}

interface IUser {
  id: string;
  email: string;
  role: UserRole;
}