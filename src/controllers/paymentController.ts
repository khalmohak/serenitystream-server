import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  createPayment = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.body;
      const userId = req.user.id; 

      const payment = await this.paymentService.createPayment(userId, courseId);
      res.json(payment);
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  };

  confirmPayment = async (req: Request, res: Response) => {
    try {
      const { paymentId, providerPaymentId } = req.body;
      const payment = await this.paymentService.confirmPayment(
        paymentId,
        providerPaymentId
      );
      res.json(payment);
    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  };

  refundPayment = async (req: Request, res: Response) => {
    try {
      const { paymentId, reason } = req.body;
      const payment = await this.paymentService.refundPayment(paymentId, reason);
      res.json(payment);
    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({ error: 'Failed to process refund' });
    }
  };

  getPaymentDetails = async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const payment = await this.paymentService.getPaymentDetails(paymentId);
      res.json(payment);
    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({ error: 'Failed to get payment details' });
    }
  };

  getUserPayments = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id; // Assuming you have user data in request
      const payments = await this.paymentService.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error('Get user payments error:', error);
      res.status(500).json({ error: 'Failed to get user payments' });
    }
  };
}