import { Router } from 'express';
import authRoutes from './auth.routes';
import institutionRoutes from './institution.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import moduleRoutes from './module.routes';
import contentRoutes from './content.routes';
import progressRoutes from './progress.routes';
import enrollmentRoutes from './enrollment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/institutions', institutionRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/content', contentRoutes);
router.use('/progress', progressRoutes);
router.use('/enrollments', enrollmentRoutes);

export default router;