import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { Institution } from './Institution';
import { CourseEnrollment } from './CourseEnrollment';
import { UserProgress } from './UserProgress';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum, IsOptional, Length, IsPhoneNumber } from 'class-validator';
import { Course } from '.';

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @Column()
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters long' })
  password: string;

  @Column()
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters long' })
  firstName: string;

  @Column({ nullable: true })
  @Length(1, 50, { message: 'Middle name must be between 1 and 50 characters long' })
  @IsOptional()
  middleName?: string;

  @Column()
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters long' })
  lastName: string;

  @Column()
  // @IsPhoneNumber(null, { message: 'Invalid phone number' })
  phoneNumber: string;

  @Column()
  @Length(1, 10, { message: 'Country code must be between 1 and 10 characters long' })
  countryCode: string;

  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: UserRole;

  @Column({ nullable: true })
  @IsOptional()
  institutionId?: string;

  @ManyToOne(() => Institution, (institution) => institution.users, { nullable: true })
  institution?: Institution;

  @OneToMany(() => CourseEnrollment, (enrollment) => enrollment.user)
  enrollments: CourseEnrollment[];

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress: UserProgress[];

  @OneToMany(() => Course, (course) => course.instructor)
  createdCourses: Course[];
  
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
