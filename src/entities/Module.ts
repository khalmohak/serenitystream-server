import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Length, IsNotEmpty, Min, IsOptional, IsInt } from "class-validator";
import { Course } from "./Course";
import { ContentItem } from "./ContentItem";

@Entity("modules")
export class Module {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty({ message: "Title is required" })
  @Length(3, 100, { message: "Title must be between 3 and 100 characters" })
  title: string;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  @Length(0, 500, { message: "Description cannot exceed 500 characters" })
  description: string;

  @Column()
  @Index(['module', 'sequenceNo'], { unique: true }) // Ensures sequence numbers are unique within a module
  @IsInt({ message: 'Sequence number must be an integer' })
  @Min(1, { message: 'Sequence number must be at least 1' })
  sequenceNo: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: "int", default: 0 })
  @Min(0)
  duration: number; // in minutes

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    prerequisites?: string[];
    learningObjectives?: string[];
    skillLevel?: "beginner" | "intermediate" | "advanced";
    tags?: string[];
  };

  @ManyToOne(() => Course, (course) => course.modules, {
    nullable: false,
    onDelete: "CASCADE",
  })
  course: Course;

  @OneToMany(() => ContentItem, (item) => item.module, {
    cascade: true,
  })
  contentItems: ContentItem[];

  @Column({ type: "int", default: 0 })
  contentItemsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get totalDuration(): number {
    if (!this.contentItems) return this.duration;
    return this.contentItems.reduce(
      (total, item) => total + (item.duration || 0),
      0,
    );
  }

  get isComplete(): boolean {
    return this.contentItemsCount > 0 && this.isPublished;
  }
}

// Optional: Add TypeScript types for metadata
export interface ModuleMetadata {
  prerequisites?: string[];
  learningObjectives?: string[];
  skillLevel?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
}
