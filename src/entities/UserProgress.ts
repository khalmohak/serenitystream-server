import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { IsInt, Min, Max, IsOptional } from "class-validator";
import { User } from "./User";
import { ContentItem } from "./ContentItem";

export enum ProgressStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

@Entity("user_progress")
@Index(["user", "contentItem"], { unique: true })
export class UserProgress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.progress, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user: User;

  @ManyToOne(() => ContentItem, {
    nullable: false,
    onDelete: "CASCADE",
  })
  contentItem: ContentItem;

  @Column({ type: "int", default: 0 })
  @IsInt({ message: "Progress must be an integer" })
  @Min(0, { message: "Progress cannot be negative" })
  @Max(100, { message: "Progress cannot exceed 100%" })
  progress: number;

  @Column({
    type: "enum",
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    lastPosition?: number; // For videos: last watched position in seconds
    quizAttempts?: number; // For quizzes: number of attempts
    quizScores?: number[]; // For quizzes: history of scores
    downloadedAt?: Date; // For materials: when it was downloaded
    timeSpent?: number; // Time spent in minutes
    notes?: string; // User's notes
    bookmarks?: number[]; // Bookmarked positions in video
  };

  @Column({ nullable: true })
  @IsOptional()
  completedAt: Date;

  @Column({ type: "int", default: 0 })
  @IsInt()
  @Min(0)
  attempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastAccessedAt: Date;

  // Virtual property to check if the content is completed
  get isCompleted(): boolean {
    return this.progress === 100 || this.status === ProgressStatus.COMPLETED;
  }

  get daysSinceLastAccess(): number {
    if (!this.lastAccessedAt) return 0;
    const diffTime = Math.abs(
      new Date().getTime() - this.lastAccessedAt.getTime(),
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Optional: Add TypeScript type for metadata
export interface ProgressMetadata {
  lastPosition?: number;
  quizAttempts?: number;
  quizScores?: number[];
  downloadedAt?: Date;
  timeSpent?: number;
  notes?: string;
  bookmarks?: number[];
}
