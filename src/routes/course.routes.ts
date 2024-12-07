// import { Router } from 'express';
// import { courseController } from '../controllers';
// import { auth } from '../middleware/auth';

// const router = Router();

// router.post('/', auth, courseController.create);
// router.get('/', auth, courseController.list);
// router.get('/:id', auth, courseController.get);
// router.put('/:id', auth, courseController.update);
// router.post('/:id/publish', auth, courseController.publish);

// // Module-related routes within courses
// router.post('/:courseId/modules', auth, moduleController.create);
// router.get('/:courseId/modules', auth, moduleController.list);


import { Router } from 'express';
const router = Router();
export default router;