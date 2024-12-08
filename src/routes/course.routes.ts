import { Router } from "express";
import { CourseController } from "../controllers/courseController";
import { CreateCourseDto, UpdateCourseDto } from "../dtos/course.dto";
import { CreateReviewDto } from "../dtos/review.dto";
import { UserRole } from "../entities/User";
import { authMiddleware } from "../middleware/auth";
import { checkRole } from "../middleware/checkRole";
import { validateMiddleware } from "../middleware/validateMiddleware";

const router = Router();
const courseController = new CourseController();

router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getDetailedCourse);

router.use(authMiddleware());

// Student routes
router.post(
  "/:id/reviews",
  checkRole([UserRole.STUDENT]),
  validateMiddleware(CreateReviewDto),
  courseController.addReview,
);

// Instructor routes
router.post(
  "/",
  checkRole([UserRole.INSTRUCTOR]),
  validateMiddleware(CreateCourseDto),
  courseController.createCourse,
);

router.put(
  "/:id",
  checkRole([UserRole.INSTRUCTOR]),
  validateMiddleware(UpdateCourseDto),
  courseController.updateCourse,
);

router.delete(
  "/:id",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.deleteCourse,
);

router.post(
  "/:id/publish",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.publishCourse,
);

router.post(
  "/:id/unpublish",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.unpublishCourse,
);

router.post(
  "/:courseId/modules",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.createModule,
);

router.put(
  "/modules/:id",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.updateModule,
);

router.post(
  "/modules/:moduleId/content",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.createContentItem,
);

router.put(
  "/content/:id",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.updateContentItem,
);

router.get(
  "/:id/enrollments",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.getEnrollments,
);

router.get(
  "/:id/stats",
  checkRole([UserRole.INSTRUCTOR]),
  courseController.getCourseStats,
);

export default router;
