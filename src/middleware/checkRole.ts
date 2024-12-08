import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/User';
import { HttpException } from '../exceptions/HttpException';

export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    if (!roles.includes(req.user.role)) {
      throw new HttpException(500,'You do not have permission to perform this action');
    }
    next();
  };
};