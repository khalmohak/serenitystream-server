import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { FavoriteService } from '../services/favoriteService';

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor() {
    this.favoriteService = new FavoriteService();
  }

  toggleFavoriteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const result = await this.favoriteService.toggleFavoriteCourse(
        req.user.id,
        req.params.courseId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleFavoriteInstructor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const result = await this.favoriteService.toggleFavoriteInstructor(
        req.user.id,
        req.params.instructorId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getFavoriteCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const favorites = await this.favoriteService.getUserFavoriteCourses(req.user.id);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  };

  getFavoriteInstructors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const favorites = await this.favoriteService.getUserFavoriteInstructors(req.user.id);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  };
}
