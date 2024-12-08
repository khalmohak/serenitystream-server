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
import { Instructor } from './Instructor';

@Entity('favorite_instructors')
@Unique(['userId', 'instructorId'])
export class FavoriteInstructor {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id: string;

  @ManyToOne(() => User, user => user.favoriteInstructors, { 
    onDelete: 'CASCADE',
    nullable: false 
  })
  user: User;

  @Column()
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @ManyToOne(() => Instructor, instructor => instructor.favorites, { 
    onDelete: 'CASCADE',
    nullable: false 
  })
  instructor: Instructor;

  @Column()
  @IsUUID('4')
  @IsNotEmpty()
  instructorId: string;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;
}