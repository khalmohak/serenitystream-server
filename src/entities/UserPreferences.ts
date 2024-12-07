import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: 'light' })
  theme: string; 

  @Column({ default: true })
  receiveNotifications: boolean;

  @Column({ default: 'en' })
  language: string; 

  @Column({ nullable: true })
  otherPreferences: string; 
}
