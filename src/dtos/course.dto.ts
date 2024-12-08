import { IsString, IsNumber, IsOptional, IsEnum, IsUrl, IsArray, IsUUID, Min, Length } from 'class-validator';
import { ContentType } from '../entities';
import { CourseLevel, Currency } from '../entities/Course';

export class CreateCourseDto {
  @IsString()
  @Length(5, 255)
  title: string;

  @IsString()
  @Length(20, 5000)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUUID()
  institutionId?: string;
}

export class UpdateCourseDto extends CreateCourseDto {
  @IsOptional()
  @IsString()
  @Length(5, 255)
  title: string;

  @IsOptional()
  @IsString()
  @Length(20, 5000)
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateModuleDto {
  @IsString()
  @Length(3, 100)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsNumber()
  @Min(1)
  sequenceNo: number;

  @IsUUID()
  courseId: string;
}

export class CreateContentItemDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsEnum(ContentType)
  type: ContentType;

  @IsNumber()
  @Min(1)
  sequenceNo: number;

  @IsUUID()
  moduleId: string;
}
