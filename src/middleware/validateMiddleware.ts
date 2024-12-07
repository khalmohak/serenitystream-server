import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';

export const validateMiddleware = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoObj = plainToClass(dtoClass, req.body);
      const errors = await validate(dtoObj);

      if (errors.length > 0) {
        const message = errors.map(error => Object.values(error.constraints!)).join(', ');
        next(new HttpException(400, message));
      } else {
        req.body = dtoObj;
        next();
      }
    } catch (error) {
      next(error);
    }
  };
};