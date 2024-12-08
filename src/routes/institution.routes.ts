import { Router } from 'express';
import { InstitutionController } from '../controllers/institutionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const institutionController = new InstitutionController();

router.post('/', authMiddleware(), institutionController.create);
router.get('/', authMiddleware(), institutionController.list);
router.get('/:id', authMiddleware(), institutionController.get);
router.put('/:id', authMiddleware(), institutionController.update);

export default router;
