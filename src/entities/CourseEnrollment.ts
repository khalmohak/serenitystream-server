import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';
import { IsEnum, IsDate } from 'class-validator';

// Enum for Enrollment Status
export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled', // Added for additional flexibility
}

@Entity('course_enrollments')
export class CourseEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  course: Course;

  @CreateDateColumn()
  enrolledAt: Date; // Automatically sets the enrollment timestamp

  @UpdateDateColumn()
  updatedAt: Date; // Tracks updates to the enrollment record

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  @IsEnum(EnrollmentStatus, { message: 'Invalid enrollment status' })
  status: EnrollmentStatus;

  @Column({ type: 'date', nullable: true })
  @IsDate({ message: 'expiryDate must be a valid date' })
  expiryDate?: Date; // Optional, for courses with an expiration period

  @Column({ nullable: true })
  @IsDate({ message: 'completedAt must be a valid date' })
  completedAt?: Date; // Optional, marks when the course was completed
}
