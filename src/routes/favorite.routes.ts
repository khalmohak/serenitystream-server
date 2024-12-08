import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController';
import { ToggleFavoriteDto } from '../dtos/favorite.dto';
import { authMiddleware } from '../middleware/auth';
import { validateMiddleware } from '../middleware/validateMiddleware';

const router = Router();
const favoriteController = new FavoriteController();

// All routes require authentication
router.use(authMiddleware());

// Course favorites
router.post(
  '/courses/:courseId',
  validateMiddleware(ToggleFavoriteDto),
  favoriteController.toggleFavoriteCourse
);
router.get('/courses', favoriteController.getFavoriteCourses);

// Instructor favorites
router.post(
  '/instructors/:instructorId',
  validateMiddleware(ToggleFavoriteDto),
  favoriteController.toggleFavoriteInstructor
);
router.get('/instructors', favoriteController.getFavoriteInstructors);

export default router;