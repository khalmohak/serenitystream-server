import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Payment } from "./Payment";
import { User } from "./User";
import { Course } from "./Course";

export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  VOID = "void",
  CANCELLED = "cancelled"
}

@Entity("invoices")
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  invoiceNumber: string; // Custom formatted invoice number (e.g., INV-2024-0001)

  @OneToOne(() => Payment)
  @JoinColumn()
  payment: Payment;

  @Column()
  paymentId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Course)
  course: Course;

  @Column()
  courseId: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: "enum", enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ type: "jsonb" })
  billingDetails: {
    name: string;
    email: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country: string;
      postalCode?: string;
    };
    taxId?: string;
  };

  @Column({ type: "jsonb" })
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  pdfUrl?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  paidAt?: Date;
}
