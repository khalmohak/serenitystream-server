import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Course } from './Course';
import { User } from './User';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rating: number;

  @Column('text')
  comment: string;

  @ManyToOne(() => Course, course => course.reviews)
  course: Course;

  @Column()
  courseId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}