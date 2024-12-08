import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("refresh_tokens")
@Index("idx_token_isValid", ["token", "isValid"]) // Composite index for token lookups with validity check
@Index("idx_userId_isValid", ["userId", "isValid"]) // Composite index for user's valid tokens
@Index("idx_expiresAt", ["expiresAt"]) // Index for cleanup queries
export  class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  token: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column()
  deviceId: string;

  @Column()
  userAgent: string;

  @Column()
  ipAddress: string;

  @Column({ default: true })
  isValid: boolean;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
