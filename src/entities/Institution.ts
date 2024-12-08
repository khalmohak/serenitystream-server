import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';
import { IsString, IsOptional, IsUrl, Length } from 'class-validator';
import { Instructor } from './Instructor';

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Length(3, 255, { message: 'Institution name must be between 3 and 255 characters' })
  name: string;

  @Column({ unique: true })
  @IsUrl({ require_tld: true }, { message: 'Invalid domain URL' })
  domain: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @Length(10, 1000, { message: 'Description must be between 10 and 1000 characters' })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  settings?: Record<string, any>; 

  @Column({ nullable: true })
  @IsOptional()
  logoUrl?: string; 

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  tags?: string[]; 
  
  @OneToMany(() => User, (user) => user.institution)
  users: User[];

  @OneToMany(() => Instructor, (instructor) => instructor.institution)
  instructors: Instructor[];
  
  @OneToMany(() => Course, (course) => course.institution)
  courses: Course[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
