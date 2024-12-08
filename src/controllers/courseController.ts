import { Request, Response, NextFunction } from "express";
import { CreateCourseDto, UpdateCourseDto } from "../dtos/course.dto";
import { CourseLevel } from "../entities";
import { HttpException } from "../exceptions/HttpException";
import { CourseService } from "../services/courseService";

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await this.courseService.createCourse(
        req.user.id,
        req.body,
      );
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  };

  getCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await this.courseService.getCourseById(req.params.id);
      res.json(course);
    } catch (error) {
      next(error);
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await this.courseService.updateCourse(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json(course);
    } catch (error) {
      next(error);
    }
  };

  deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.courseService.deleteCourse(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  publishCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await this.courseService.publishCourse(
        req.params.id,
        req.user.id,
      );
      res.json(course);
    } catch (error) {
      next(error);
    }
  };

  enrollInCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enrollment = await this.courseService.enrollStudent(
        req.params.id,
        req.user.id,
      );
      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  };

  getCourseStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.courseService.getCourseStats(req.params.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page,
        limit,
        search,
        minPrice,
        maxPrice,
        level,
        instructorId,
        institutionId,
        sort,
      } = req.query;

      const courses = await this.courseService.getAllCourses(
        Number(page) || 1,
        Number(limit) || 10,
        {
          search: search as string,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          level: level as CourseLevel,
          instructorId: instructorId as string,
          institutionId: institutionId as string,
        },
        sort
          ? {
              field: (sort as string).split(":")[0] as
                | "price"
                | "createdAt"
                | "title",
              order: (sort as string).split(":")[1] as "ASC" | "DESC",
            }
          : undefined,
      );

      res.json(courses);
    } catch (error) {
      next(error);
    }
  };

  getDetailedCourse = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const course = await this.courseService.getDetailedCourse(req.params.id);
      res.json(course);
    } catch (error) {
      next(error);
    }
  };

  createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpException(401, "Unauthorized");
      const module = await this.courseService.createModule(
        req.params.courseId,
        req.user.id,
        req.body,
      );
      res.status(201).json(module);
    } catch (error) {
      next(error);
    }
  };

  unpublishCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpException(401, "Unauthorized");
      const course = await this.courseService.unpublishCourse(
        req.params.id,
        req.user.id,
      );
      res.json(course);
    } catch (error) {
      next(error);
    }
  };

  updateModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpException(401, "Unauthorized");
      const module = await this.courseService.updateModule(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json(module);
    } catch (error) {
      next(error);
    }
  };

  // Content Item Management
  createContentItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new HttpException(401, "Unauthorized");
      const contentItem = await this.courseService.createContentItem(
        req.params.moduleId,
        req.user.id,
        req.body,
      );
      res.status(201).json(contentItem);
    } catch (error) {
      next(error);
    }
  };

  updateContentItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new HttpException(401, "Unauthorized");
      const contentItem = await this.courseService.updateContentItem(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json(contentItem);
    } catch (error) {
      next(error);
    }
  };

  // Reviews Management
  addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpException(401, "Unauthorized");
      const review = await this.courseService.addReview(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpException(401, "Unauthorized");
      const review = await this.courseService.updateReview(
        req.params.reviewId,
        req.user.id,
        req.body,
      );
      res.json(review);
    } catch (error) {
      next(error);
    }
  };

  getEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpException(401, "Unauthorized");
      const enrollments = await this.courseService.getEnrollments(
        req.params.id,
        req.user.id,
      );
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  };
}
