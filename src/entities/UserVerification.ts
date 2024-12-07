import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Timestamp,
} from "typeorm";
import { User } from "./User";

@Entity("user_verifications")
export class UserVerification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  user: User;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: "varchar", nullable: true, length: 255 })
  emailVerificationToken: string | null;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ type: "varchar", nullable: true, length: 6 })
  phoneVerificationToken: string | null;

  @Column({ nullable: true, type: "timestamp" })
  emailTokenExpiresAt: Date | null;

  @Column({ nullable: true, type: "timestamp" })
  phoneTokenExpiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
