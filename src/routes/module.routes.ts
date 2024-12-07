// import { Router } from 'express';
// import { moduleController } from '../controllers';
// import { auth } from '../middleware/auth';

// const router = Router();

// router.put('/:id', auth, moduleController.update);
// router.delete('/:id', auth, moduleController.delete);

// // Content-related routes within modules
// router.post('/:moduleId/content', auth, contentController.create);
// router.get('/:moduleId/content', auth, contentController.list);

// export default router;

import { Router } from 'express';
const router = Router();
export default router;