import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Institution } from './Institution';
import { Module } from './Module';
import { IsString, Length, IsPositive, IsUrl, IsOptional, IsEnum } from 'class-validator';
import { User } from '.';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  INR = 'INR',
  AUD = 'AUD',
  CAD = 'CAD',
  JPY = 'JPY',
}


@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Length(5, 255, { message: 'Title must be between 5 and 255 characters long' })
  title: string;

  @Column({ type: 'text' })
  @Length(20, 5000, { message: 'Description must be between 20 and 5000 characters long' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  @IsUrl({}, { message: 'Invalid URL for the course image' })
  @IsOptional()
  imageUrl?: string;
  
  @Column({ type: 'enum', enum: Currency, default: Currency.USD })
  @IsEnum(Currency, { message: 'Invalid currency' })
  currency: Currency;

  @Column({ type: 'int', nullable: true })
  @IsPositive({ message: 'Duration must be a positive number (in minutes)' })
  @IsOptional()
  duration?: number; // in minutes

  @Column({ type: 'enum', enum: CourseLevel, nullable: true })
  @IsEnum(CourseLevel, { message: 'Invalid course level' })
  @IsOptional()
  level?: CourseLevel;

  @Column('simple-array', { nullable: true })
  @IsOptional()
  tags?: string[]; 

  @ManyToOne(() => Institution, (institution) => institution.courses, { nullable: true })
  @IsOptional()
  institution: Institution;
  
  @ManyToOne(() => User, (user) => user.createdCourses, { nullable: false })
  instructor: User;

  @OneToMany(() => Module, (module) => module.course)
  modules: Module[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
