import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { authMiddleware } from '../middleware/auth';
const router = Router();

router.use(authMiddleware());

const searchController = new SearchController();

router.get('/', searchController.globalSearch);
router.get('/institution', searchController.institutionSearch);
router.get('/instructor', searchController.instructorSearch);


export default router;