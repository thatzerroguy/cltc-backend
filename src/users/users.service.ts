/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DrizzleDatabase } from '../database/database.types';
import * as bcrypt from 'bcrypt';
import { userSchema } from '../database/schema';
import { profileSchema } from '../database/schema/profile.schema';
import { departmentSchema } from '../database/schema/departments.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@Inject('DRIZZLE') private readonly drizzle: DrizzleDatabase) {}

  async findAll() {
    const users = await this.drizzle.query.userSchema.findMany({
      with: {
        profile: true,
      },
    });

    return users.map((user) => {
      const profile = user.profile as any;
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        department: profile?.department || user.department,
        name: profile?.name || user.username,
        email: profile?.email || '',
        position: profile?.position || '',
        avatarUrl: `https://ui-avatars.com/api/?name=${
          profile?.name || user.username
        }`,
      };
    });
  }

  async create(createUserDto: any) {
    // 1. Check if user exists
    const existingUser = await this.drizzle.query.userSchema.findFirst({
      where: (users, { eq }) => eq(users.username, createUserDto.username),
    });

    if (existingUser) {
      throw new Error('Username already exists');
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 3. Resolve Department ID
    let departmentId: string | null = null;
    const deptName = createUserDto.department || 'ICT';
    
    // Try to find department by name
    const existingDept = await this.drizzle.query.departmentSchema.findFirst({
      where: (depts, { eq }) => eq(depts.name, deptName),
    });

    if (existingDept) {
      departmentId = existingDept.id;
    } else {
      this.logger.log(`Department ${deptName} not found, creating it...`);
      const [newDept] = await this.drizzle
        .insert(departmentSchema)
        .values({ name: deptName })
        .returning();
      departmentId = newDept.id;
    }

    // 4. Create User
    const [user] = await this.drizzle
      .insert(userSchema)
      .values({
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role || 'STAFF', 
        department: deptName,
        department_id: departmentId,
      })
      .returning();

    // 5. Create Profile
    await this.drizzle.insert(profileSchema).values({
      user_id: user.id,
      name: createUserDto.name,
      email: createUserDto.email,
      department: deptName,
      position: createUserDto.position || '',
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      department: deptName,
      name: createUserDto.name,
      email: createUserDto.email,
      position: createUserDto.position,
    };
  }

  async update(id: string, updateUserDto: any) {
    this.logger.log(`Updating user ${id} with data: ${JSON.stringify(updateUserDto)}`);
    
    const user = await this.drizzle.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.id, id),
    });

    if (!user) {
        this.logger.error(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Handle Password Update if provided
    let password: string | undefined = undefined;
    if (updateUserDto.password) {
        password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Handle Department Update
    let departmentId: string | undefined = undefined;
    let deptName = updateUserDto.department;
    
    if (deptName) {
        this.logger.log(`Resolving department: ${deptName}`);
        const existingDept = await this.drizzle.query.departmentSchema.findFirst({
            where: (depts, { eq }) => eq(depts.name, deptName),
        });
        if (existingDept) {
            departmentId = existingDept.id;
            this.logger.log(`Found existing department ID: ${departmentId}`);
        } else {
            this.logger.log(`Creating new department: ${deptName}`);
             const [newDept] = await this.drizzle
                .insert(departmentSchema)
                .values({ name: deptName })
                .returning();
            departmentId = newDept.id;
        }
    }

    // Update User
    this.logger.log(`Executing database update for user ${id}`);
    await this.drizzle.update(userSchema).set({
        username: updateUserDto.username,
        role: updateUserDto.role,
        ...(password ? { password } : {}),
        ...(deptName ? { department: deptName } : {}),
        ...(departmentId ? { department_id: departmentId } : {}),
    }).where(eq(userSchema.id, id));
    
    // Update Profile
    await this.drizzle.update(profileSchema).set({
        name: updateUserDto.name,
        email: updateUserDto.email,
        ...(deptName ? { department: deptName } : {}), // Standardize object spread
        position: updateUserDto.position || '',
    }).where(eq(profileSchema.user_id, id));

    return { message: 'User updated successfully' };
  }

  async remove(id: string) {
      // Check if user exists
      const user = await this.drizzle.query.userSchema.findFirst({
          where: (users, { eq }) => eq(users.id, id),
      });

      if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Delete Profile first (FK constraint)
      await this.drizzle.delete(profileSchema).where(eq(profileSchema.user_id, id));
      
      // Delete User
      await this.drizzle.delete(userSchema).where(eq(userSchema.id, id));

      return { message: 'User deleted successfully' };
  }
}
