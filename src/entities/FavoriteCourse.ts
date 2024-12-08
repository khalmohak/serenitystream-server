import { 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  ManyToOne, 
  Column, 
  Unique 
} from 'typeorm';
import { IsUUID, IsDate, IsNotEmpty } from 'class-validator';
import { User } from './User';
import { Course } from './Course';

@Entity('favorite_courses')
@Unique(['userId', 'courseId'])
export class FavoriteCourse {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ManyToOne(() => User, user => user.favoriteCourses, { 
    onDelete: 'CASCADE',
    nullable: false 
  })
  user: User;

  @Column()
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @ManyToOne(() => Course, course => course.favorites, { 
    onDelete: 'CASCADE',
    nullable: false 
  })
  course: Course;

  @Column()
  @IsUUID('4')
  @IsNotEmpty()
  courseId: string;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;
}