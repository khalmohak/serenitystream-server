import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { decode } from "querystring";
import { config } from "../config/config";
import { UserRole } from "../entities";
import { HttpException } from "../exceptions/HttpException";

export const authMiddleware = (allowedRoles?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new HttpException(401, "No token provided");
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: UserRole;
      };
      
      console.log(decoded)

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        throw new HttpException(403, "Insufficient permissions");
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new HttpException(401, "Invalid token"));
      } else {
        next(error);
      }
    }
  };
};
