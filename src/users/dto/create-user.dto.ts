import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto as AuthCreateUserDto } from '../../auth/dto/create-user.dto';

// Define enums to match database schema/types
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DG = 'DG',
  HOD = 'HOD',
  STAFF = 'STAFF',
  SECRETARY = 'SECRETARY',
  SCHOOL_COORDINATOR = 'SCHOOL_COORDINATOR',
  COURSE_INSTRUCTOR = 'COURSE_INSTRUCTOR',
}

export enum Department {
  ICT = 'ICT',
  HR = 'HR',
  ADMINISTRATION = 'ADMINISTRATION',
  ACCOUNTS = 'ACCOUNTS',
  OPERATIONS = 'OPERATIONS',
}

export class CreateFullUserDto extends AuthCreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Department)
  department!: string;

  @IsString()
  @IsOptional()
  position?: string;
  
  @IsEnum(UserRole)
  @IsOptional()
  role?: string;
}
