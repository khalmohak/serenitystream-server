import { IsUUID, IsNotEmpty } from 'class-validator';

export class ToggleFavoriteDto {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;  // This can be either courseId or instructorId
}