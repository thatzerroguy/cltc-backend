
import { PartialType } from '@nestjs/mapped-types';
import { CreateFullUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateFullUserDto) {}
