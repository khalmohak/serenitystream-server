import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Payment, PaymentStatus, PaymentProvider } from "../entities/Payment";
import { Course } from "../entities/Course";
import { User } from "../entities/User";
import { CourseEnrollment } from "../entities/CourseEnrollment";
import { PayPalService } from "./paypalServices";
import { InvoiceService } from "./invoiceServices";

export class PaymentService {
  private paymentRepository: Repository<Payment>;
  private courseRepository: Repository<Course>;
  private enrollmentRepository: Repository<CourseEnrollment>;
  private paypalService: PayPalService;
  private invoiceService: InvoiceService;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.courseRepository = AppDataSource.getRepository(Course);
    this.enrollmentRepository = AppDataSource.getRepository(CourseEnrollment);
    this.paypalService = new PayPalService();
    this.invoiceService = new InvoiceService();
  }

  async createPayment(userId: string, courseId: string): Promise<Payment> {
    const course = await this.courseRepository.findOneOrFail({ 
      where: { id: courseId }
    });

    const paypalOrder = await this.paypalService.createOrder({
      amount: course.price,
      currency: course.currency,
      description: `Payment for course: ${course.title}`
    });

    const payment = this.paymentRepository.create({
      amount: course.price,
      currency: course.currency,
      status: PaymentStatus.PENDING,
      provider: PaymentProvider.PAYPAL,
      providerId: paypalOrder.id,
      userId,
      courseId,
      providerResponse: paypalOrder
    });

    return this.paymentRepository.save(payment);
  }

  async confirmPayment(paymentId: string, providerPaymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOneOrFail({
      where: { id: paymentId },
      relations: ['course', 'user']
    });

    const invoice = await this.invoiceService.createInvoice(payment);
    
    await this.invoiceService.sendInvoice(invoice.id);
    
    return payment;
    
    const paypalPayment = await this.paypalService.captureOrder(providerPaymentId);
    
    if (paypalPayment.status === 'COMPLETED') {
      payment.status = PaymentStatus.COMPLETED;
      payment.providerResponse = paypalPayment;

      const enrollment = this.enrollmentRepository.create({
        userId: payment.userId,
        courseId: payment.courseId,
        paymentId: payment.id
      });

      await this.enrollmentRepository.save(enrollment);
      
      const invoice = await this.invoiceService.createInvoice(payment);
      
      await this.invoiceService.sendInvoice(invoice.id);
      
      return this.paymentRepository.save(payment);
    }

    payment.status = PaymentStatus.FAILED;
    payment.providerResponse = paypalPayment;
    return this.paymentRepository.save(payment);
  }

  async refundPayment(paymentId: string, reason: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOneOrFail({
      where: { id: paymentId }
    });

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Payment cannot be refunded');
    }

    // Process refund with PayPal
    const refund = await this.paypalService.refundPayment(payment.providerId);

    payment.status = PaymentStatus.REFUNDED;
    payment.refundId = refund.id;
    payment.refundReason = reason;
    payment.providerResponse = refund;

    return this.paymentRepository.save(payment);
  }

  async getPaymentDetails(paymentId: string): Promise<Payment> {
    return this.paymentRepository.findOneOrFail({
      where: { id: paymentId },
      relations: ['course', 'user']
    });
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['course'],
      order: { createdAt: 'DESC' }
    });
  }
}
