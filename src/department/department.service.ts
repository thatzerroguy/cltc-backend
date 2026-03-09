import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleDatabase } from 'src/database/database.types';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { departmentSchema } from 'src/database/schema/departments.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);
  constructor(
    @Inject('DRIZZLE') private readonly drizzle: DrizzleDatabase,
    private readonly config: ConfigService,
  ) {}

  /**
   * @author - thatzerroguy
   * @description - Create department by super admin
   * @param {CreateDepartmentDto} dto - data for new department
   */
  async createDepartment(dto: CreateDepartmentDto) {
    try {
      // Check if department already exists
      const [existingDepartment] = await this.drizzle
        .select()
        .from(departmentSchema)
        .where(eq(departmentSchema.name, dto.name))
        .limit(1);

      if (existingDepartment) {
        throw new ConflictException('Department with this name already exists');
      }

      // Create new department
      const [newDepartment] = await this.drizzle
        .insert(departmentSchema)
        .values({
          name: dto.name,
        })
        .returning();

    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error('Failed to create department', error);
      throw error;
    }
  }

  async findAll() {
    return await this.drizzle.query.departmentSchema.findMany();
  }
}
