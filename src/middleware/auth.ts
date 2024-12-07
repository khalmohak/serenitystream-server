import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { HttpException } from '../exceptions/HttpException';

export const authMiddleware = (allowedRoles?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException(401, 'No token provided');
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        throw new HttpException(403, 'Insufficient permissions');
      }

      //@ts-ignore
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new HttpException(401, 'Invalid token'));
      } else {
        next(error);
      }
    }
  };
};