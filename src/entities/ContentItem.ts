import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { Module } from "./Module";
import {
  IsEnum,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMinSize,
  IsUrl,
  Length,
  IsInt,
  Min,
  IsPositive,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

// Enum for Content Types
export enum ContentType {
  QUIZ = "quiz",
  MATERIAL = "material",
  VIDEO = "video",
}

// TypeScript interfaces for content structure
type QuizContent = {
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
};

type MaterialContent = {
  url: string;
  description: string;
  name: string;
};

type VideoContent = {
  s3Url: string; // URL for the video
  dashUrl: string; // DASH streaming URL
};

// Unified content type
type Content = QuizContent | MaterialContent | VideoContent;

@Entity("content_items")
export class ContentItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Length(1, 255, {
    message: "Title must be between 1 and 255 characters long",
  })
  title: string;

  @Column({ type: "enum", enum: ContentType })
  @IsEnum(ContentType, { message: "Invalid content type" })
  type: ContentType;

  @Column({ type: "jsonb" })
  @ValidateNested()
  @Type(() => Object)
  content: Content;

  @Column({ type: "int", nullable: true })
  @IsPositive({ message: "Duration must be a positive number (in minutes)" })
  @IsOptional()
  duration?: number; // in minutes

  @Column()
  @Index(["module", "sequenceNo"], { unique: true }) // Ensures sequence numbers are unique within a module
  @IsInt({ message: "Sequence number must be an integer" })
  @Min(1, { message: "Sequence number must be at least 1" })
  sequenceNo: number;

  @ManyToOne(() => Module, (module) => module.contentItems, {
    nullable: false,
    onDelete: "CASCADE",
  })
  module: Module;
}
