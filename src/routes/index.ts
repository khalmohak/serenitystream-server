import { Router } from 'express';
import authRoutes from './auth.routes';
import institutionRoutes from './institution.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import moduleRoutes from './module.routes';
import contentRoutes from './content.routes';
import progressRoutes from './progress.routes';
import enrollmentRoutes from './enrollment.routes';
import favoriteRoutes from './favorite.routes';
import videoRoutes from "./video.routes";
import searchRoutes from './search.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/institutions', institutionRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/favorite', favoriteRoutes);
router.use('/modules', moduleRoutes);
router.use('/payment', paymentRoutes);
router.use('/search', searchRoutes);
router.use('/video', videoRoutes);
router.use('/content', contentRoutes);
router.use('/progress', progressRoutes);
router.use('/enrollments', enrollmentRoutes);

export default router;