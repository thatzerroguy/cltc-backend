import { IsArray, IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @IsUUID()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsDate()
  @IsNotEmpty()
  publishDate: string;

  @IsString()
  @IsNotEmpty()
  mainImage: string;

  @IsArray()
  @IsNotEmpty()
  optionalImages: string[];

  @IsString()
  @IsNotEmpty()
  status: string;
}
