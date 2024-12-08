import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
} from "typeorm";
import { Institution } from "./Institution";
import { CourseEnrollment } from "./CourseEnrollment";
import { UserProgress } from "./UserProgress";
import * as bcrypt from "bcrypt";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  Length,
  IsPhoneNumber,
  IsUrl,
} from "class-validator";
import { Course } from ".";
import { Instructor } from "./Instructor";
import { FavoriteInstructor } from "./FavoriteInstructor";
import { FavoriteCourse } from "./FavoriteCourse";

export enum UserRole {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  STUDENT = "student",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @Column()
  @Length(8, 128, {
    message: "Password must be between 8 and 128 characters long",
  })
  password: string;

  @Column()
  @Length(1, 50, {
    message: "First name must be between 1 and 50 characters long",
  })
  firstName: string;

  @Column({ nullable: true })
  @Length(1, 50, {
    message: "Middle name must be between 1 and 50 characters long",
  })
  @IsOptional()
  middleName?: string;

  @Column()
  @Length(1, 50, {
    message: "Last name must be between 1 and 50 characters long",
  })
  lastName: string;

  @Column()
  @Length(10, 12, { message: "Invalid Mobile Number" })
  phoneNumber: string;

  @Column()
  @Length(1, 10, {
    message: "Country code must be between 1 and 10 characters long",
  })
  countryCode: string;

  @Column({ type: "enum", enum: UserRole })
  @IsEnum(UserRole, { message: "Invalid user role" })
  role: UserRole;

  @Column({ nullable: true })
  @IsUrl({}, { message: "Invalid URL" })
  @IsOptional()
  imageUrl?: string;

  @OneToMany(() => CourseEnrollment, (enrollment) => enrollment.user)
  enrollments: CourseEnrollment[];

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress: UserProgress[];

  @OneToOne(() => Instructor, (instructor) => instructor.user)
  instructor?: Instructor;
  
  @OneToMany(() => FavoriteInstructor, (instructor) => instructor.instructor)
  favoriteInstructors: FavoriteInstructor[];

  @OneToMany(() => FavoriteCourse, (course) => course.course)
  favoriteCourses: FavoriteCourse[];
  
  // For institutional users
  @ManyToOne(() => Institution, (institution) => institution.users, {
    nullable: true,
  })
  institution?: Institution;

  @Column({ nullable: true })
  institutionId?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
