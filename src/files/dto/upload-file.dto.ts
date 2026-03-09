import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  targetDepartmentId: string;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
