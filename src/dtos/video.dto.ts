import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
  IsOptional,
} from "class-validator";

export class UploadVideoDto {
  @IsString()
  @IsNotEmpty({ message: "Title is required" })
  @MinLength(3, { message: "Title must be at least 3 characters long" })
  @MaxLength(100, { message: "Title cannot be longer than 100 characters" })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, {
    message: "Description cannot be longer than 1000 characters",
  })
  description?: string;
}

// DTO for creating a video
export class CreateVideoDto {
  @IsString()
  @IsNotEmpty({ message: "Title is required" })
  @MinLength(3, { message: "Title must be at least 3 characters long" })
  @MaxLength(100, { message: "Title cannot be longer than 100 characters" })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, {
    message: "Description cannot be longer than 1000 characters",
  })
  description?: string;

  @IsUUID()
  @IsNotEmpty({ message: "Instructor ID is required" })
  instructorId: string;
}

export class UpdateVideoDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: "Title must be at least 3 characters long" })
  @MaxLength(100, { message: "Title cannot be longer than 100 characters" })
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, {
    message: "Description cannot be longer than 1000 characters",
  })
  description?: string;
}

// DTO for video upload response
export class VideoResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  duration: number;

  @IsArray()
  qualities: string[];

  @IsUrl()
  dashManifestUrl: string;

  @IsUrl()
  hlsManifestUrl: string;

  createdAt: Date;
  updatedAt: Date;
}
