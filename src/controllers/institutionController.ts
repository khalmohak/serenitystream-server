import { Request, Response, NextFunction } from 'express';
import { InstitutionService } from '../services/institutionService';
import { validate } from 'class-validator';
import { HttpException } from '../exceptions/HttpException';

export class InstitutionController {
  private institutionService: InstitutionService;

  constructor() {
    this.institutionService = new InstitutionService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const institution = await this.institutionService.create(req.body);
      res.status(201).json({
        status: 'success',
        data: institution
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder = 'ASC' } = req.query;
      
      const [institutions, total] = await this.institutionService.list({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      });

      res.status(200).json({
        status: 'success',
        data: institutions,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const institution = await this.institutionService.findById(id);

      if (!institution) {
        throw new HttpException(404, 'Institution not found');
      }

      res.status(200).json({
        status: 'success',
        data: institution
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const institution = await this.institutionService.update(id, req.body);

      res.status(200).json({
        status: 'success',
        data: institution
      });
    } catch (error) {
      next(error);
    }
  };
}