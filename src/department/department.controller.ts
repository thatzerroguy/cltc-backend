import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles('super_admin', 'SUPER_ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.createDepartment(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.departmentService.findAll();
  }
}
