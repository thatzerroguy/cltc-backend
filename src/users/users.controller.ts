import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateFullUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorator/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles('super_admin', 'SUPER_ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(@Body() createUserDto: CreateFullUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles('super_admin', 'SUPER_ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('super_admin', 'SUPER_ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
