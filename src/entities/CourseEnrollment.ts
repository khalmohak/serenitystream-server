import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';
import { IsEnum, IsDate } from 'class-validator';
import { Payment } from './Payment';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled', 
}

@Entity('course_enrollments')
export class CourseEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments, { nullable: false, onDelete: 'CASCADE' })
  user: User;
  
  @Column()
  userId: string;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  course: Course;
  
  @Column()
  courseId: string;

  @Column()
  paymentId: string;
  
  @OneToOne(() => Payment, (payment) => payment.courseEnrollmentId)
  payment: Payment;
  
  @CreateDateColumn()
  enrolledAt: Date; 

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  @IsEnum(EnrollmentStatus, { message: 'Invalid enrollment status' })
  status: EnrollmentStatus;

  @Column({ type: 'date', nullable: true })
  @IsDate({ message: 'expiryDate must be a valid date' })
  expiryDate?: Date; 

  @Column({ nullable: true })
  @IsDate({ message: 'completedAt must be a valid date' })
  completedAt?: Date; 
}
