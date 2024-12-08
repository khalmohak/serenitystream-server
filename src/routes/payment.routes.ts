import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

router.use(authMiddleware());

router.post('/create', paymentController.createPayment);
router.post('/confirm', paymentController.confirmPayment);
router.get('/details/:paymentId', paymentController.getPaymentDetails);
router.get('/user', paymentController.getUserPayments);

export default router;