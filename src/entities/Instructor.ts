import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne
} from 'typeorm';
import { IsUrl, IsOptional, Length, IsEnum } from 'class-validator';
import { User } from './User';
import { Course } from './Course';
import { Institution } from './Institution';

export enum InstructorType {
  INSTITUTIONAL = 'institutional',
  INDEPENDENT = 'independent'
}

@Entity('instructors')
export class Instructor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: InstructorType })
  @IsEnum(InstructorType, { message: 'Invalid instructor type' })
  type: InstructorType;

  @Column({ nullable: true })
  @Length(1, 500, { message: 'Bio must be between 1 and 500 characters long' })
  @IsOptional()
  bio?: string;

  @Column({ nullable: true })
  @IsUrl({}, { message: 'Invalid website URL' })
  @IsOptional()
  websiteUrl?: string;

  @Column({ nullable: true })
  @IsUrl({}, { message: 'Invalid LinkedIn URL' })
  @IsOptional()
  linkedinUrl?: string;

  @Column('simple-array', { nullable: true })
  specializations?: string[];

  @Column({ nullable: true })
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters long' })
  @IsOptional()
  title?: string;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({ name: 'institutionId' })
  institution?: Institution;

  @Column({ nullable: true })
  institutionId?: string;

  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];
}