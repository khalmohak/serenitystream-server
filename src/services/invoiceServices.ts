import { Like, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Invoice, InvoiceStatus } from "../entities/Invoice";
import { Payment, PaymentStatus } from "../entities/Payment";
import PDFDocument from "pdfkit";
import { S3Service } from "./s3Service";
import { EmailService } from "./emailService";
import { format } from "date-fns";

export class InvoiceService {
  private invoiceRepository: Repository<Invoice>;
  private paymentRepository: Repository<Payment>;
  private s3Service: S3Service;
  private emailService: EmailService;

  constructor() {
    this.invoiceRepository = AppDataSource.getRepository(Invoice);
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.s3Service = new S3Service();
    this.emailService = new EmailService();
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const latestInvoice = await this.invoiceRepository.findOne({
      where: {
        invoiceNumber: Like(`INV-${year}-%`)
      },
      order: { invoiceNumber: "DESC" }
    });

    let sequence = 1;
    if (latestInvoice) {
      const lastSequence = parseInt(latestInvoice.invoiceNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `INV-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  async createInvoice(payment: Payment): Promise<Invoice> {
    const invoiceExisting = await this.invoiceRepository.findOne({
      where: {
        paymentId: payment.id
      }
    });
    
    if (invoiceExisting) { return invoiceExisting;}
    
    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      payment,
      paymentId: payment.id,
      userId: payment.userId,
      courseId: payment.courseId,
      amount: payment.amount,
      tax: 0, // Calculate tax based on your requirements
      totalAmount: payment.amount,
      status: payment.status === PaymentStatus.COMPLETED ? 
        InvoiceStatus.PAID : InvoiceStatus.DRAFT,
      billingDetails: {
        name: `${payment.user.firstName} ${payment.user.lastName}`,
        email: payment.user.email,
        //@ts-ignore
        address: payment.user?.address
      },
      items: [{
        description: payment.course.title,
        quantity: 1,
        unitPrice: payment.amount,
        amount: payment.amount
      }],
      paidAt: payment.status === PaymentStatus.COMPLETED ? new Date() : undefined
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);
    await this.generatePDF(savedInvoice);
    
    return savedInvoice;
  }

  private async generatePDF(invoice: Invoice): Promise<void> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const fileName = `invoices/${invoice.invoiceNumber}.pdf`;
      const pdfUrl = await this.s3Service.uploadFile(fileName, pdfBuffer, 'application/pdf');
      invoice.pdfUrl = pdfUrl;
      await this.invoiceRepository.save(invoice);
    });

    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.fontSize(12).text(`Date: ${format(invoice.createdAt, 'PP')}`);
    doc.moveDown();

    doc.fontSize(14).text('Billing Details:');
    doc.fontSize(12)
      .text(`Name: ${invoice.billingDetails.name}`)
      .text(`Email: ${invoice.billingDetails.email}`);
    
    if (invoice.billingDetails.address) {
      const address = invoice.billingDetails.address;
      doc.text([
        address.street,
        address.city,
        address.state,
        address.country,
        address.postalCode
      ].filter(Boolean).join(', '));
    }

    doc.moveDown();

    doc.fontSize(14).text('Items:');
    const tableTop = doc.y + 10;
    doc.fontSize(12);

    const columns = {
      description: { x: 50, width: 250 },
      quantity: { x: 300, width: 50 },
      unitPrice: { x: 350, width: 100 },
      amount: { x: 450, width: 100 }
    };

    Object.entries(columns).forEach(([header, { x }]) => {
      doc.text(header.charAt(0).toUpperCase() + header.slice(1), x, tableTop);
    });

    let y = tableTop + 20;
    invoice.items.forEach(item => {
      doc.text(item.description, columns.description.x, y)
        .text(item.quantity.toString(), columns.quantity.x, y)
        .text(`$${item.unitPrice}`, columns.unitPrice.x, y)
        .text(`$${item.amount}`, columns.amount.x, y);
      y += 20;
    });

    doc.moveDown().moveDown();

    const totalsX = 350;
    doc.text(`Subtotal: $${invoice.amount}`, totalsX);
    doc.text(`Tax: $${invoice.tax}`, totalsX);
    doc.fontSize(14).text(`Total: $${invoice.totalAmount}`, totalsX);

    doc.end();
  }

  async sendInvoice(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findOneOrFail({
      where: { id: invoiceId },
      relations: ['user', 'course']
    });

    if (!invoice.pdfUrl) {
      await this.generatePDF(invoice);
    }

    await this.emailService.sendEmail({
      to: invoice.billingDetails.email,
      subject: `Invoice ${invoice.invoiceNumber} for ${invoice.course.title}`,
      template: 'invoice',
      context: {
        invoice,
        downloadUrl: invoice.pdfUrl
      }
    });

    invoice.status = InvoiceStatus.SENT;
    await this.invoiceRepository.save(invoice);
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    return this.invoiceRepository.findOneOrFail({
      where: { id: invoiceId },
      relations: ['payment', 'user', 'course']
    });
  }

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { userId },
      relations: ['course'],
      order: { createdAt: 'DESC' }
    });
  }

  async voidInvoice(invoiceId: string, reason: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneOrFail({
      where: { id: invoiceId }
    });

    invoice.status = InvoiceStatus.VOID;
    invoice.notes = reason;
    
    return this.invoiceRepository.save(invoice);
  }
}