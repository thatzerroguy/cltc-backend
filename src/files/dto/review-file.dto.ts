import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum ReviewAction {
  APPROVE = 'approve',
  RETURN = 'return',
  REJECT = 'reject',
}

export class ReviewFileDto {
  @IsEnum(ReviewAction)
  @IsNotEmpty()
  action: ReviewAction;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  nextDepartmentId?: string;

  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}
