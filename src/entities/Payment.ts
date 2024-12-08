import { IsOptional } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { CourseEnrollment } from ".";
import { Currency } from "./Course";
import { Course } from "./Course";
import { User } from "./User";

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum PaymentProvider {
  PAYPAL = "paypal",
  STRIPE = "stripe",
  RAZORPAY = "razorpay",
}

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "enum", enum: Currency, default: Currency.INR })
  currency: Currency;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: "enum", enum: PaymentProvider })
  provider: PaymentProvider;

  @Column()
  providerId: string; // Payment ID from the provider (e.g., PayPal transaction ID)

  @Column({ type: "jsonb", nullable: true })
  providerResponse: any; // Store the complete response from payment provider

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Course)
  course: Course;

  @Column()
  courseId: string;

  @Column({ nullable: true })
  refundId?: string;

  @Column({ nullable: true })
  refundReason?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
