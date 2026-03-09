import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleDatabase } from '../database/database.types';
import { userSchema } from '../database/schema';
import { Profile, SuperAdmin } from '../interface/user.inteface';
import * as bcrypt from 'bcrypt';
import { AuthPayLoad, RefreshTokenPayload } from '../types/auth-payload';
import { ConfigService } from '@nestjs/config';
import { profileSchema } from '../database/schema/profile.schema';
import { departmentSchema } from '../database/schema/departments.schema';
import { UserRole } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject('DRIZZLE') private readonly drizzle: DrizzleDatabase,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @author: thatzerroguy
   * @description: This method is used to create a super admin.
   * @param username - The username of the super admin.
   * @param password - The password of the super admin.
   * @returns The created super admin.
   */
  public async createSuperAdmin(
    username: string,
    password: string,
  ): Promise<SuperAdmin> {
    try {
      // Check if the username already exists
      const existingUser = await this.drizzle.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.username, username),
      });

      if (existingUser) {
        throw new HttpException('Username already exists', HttpStatus.CONFLICT);
      }

      // Resolve Department ID for Super Admin (Management)
      let departmentId: string;
      const deptName = 'Management';
      const existingDept = await this.drizzle.query.departmentSchema.findFirst({
          where: (depts, { eq }) => eq(depts.name, deptName),
      });

      if (existingDept) {
          departmentId = existingDept.id;
      } else {
          const [newDept] = await this.drizzle
              .insert(departmentSchema)
              .values({ name: deptName })
              .returning();
          departmentId = newDept.id;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the super admin
      const result = await this.drizzle
        .insert(userSchema)
        .values({
          username,
          password: hashedPassword,
          role: UserRole.SUPER_ADMIN,
          department: deptName,
          department_id: departmentId,
        })
        .returning({
          id: userSchema.id,
          username: userSchema.username,
          role: userSchema.role,
        });

      const superAdmin = result[0];

      // Create profile for Super Admin
      await this.drizzle.insert(profileSchema).values({
          user_id: superAdmin.id,
          name: 'Super Admin',
          email: 'superadmin@example.com',
          department: deptName,
          position: 'Super Admin',
      });

      // Generate a JWT token for the super admin
      const payload = {
        sub: superAdmin.id,
        username: superAdmin.username,
      };
      const refreshPayload = { sub: superAdmin.id };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(refreshPayload);

      // Log the creation of the super admin
      this.logger.log(`Super admin ${username} created`);

      return {
        id: superAdmin.id,
        role: superAdmin.role,
        username: superAdmin.username,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateAccessToken(payload: AuthPayLoad): string {
    return this.jwtService.sign(payload);
  }

  public generateRefreshToken(payload: RefreshTokenPayload): string {
    const refreshSecret = this.config.get<string>('jwt.refresh.secret');
    const refreshExpiresIn = this.config.get<number>('jwt.refresh.expiresIn');

    if (!refreshSecret || !refreshExpiresIn) {
      this.logger.error('JWT refresh secret or expires in not found in config');
      throw new HttpException(
        'JWT refresh secret or expires in not found in config',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });
  }

  /**
   * @author thatzerroguy
   * @description Logs in admin
   * @param username The username of the admin
   * @param password The password of the admin
   * @returns Promise<Admin> The admin object with access tokens.
   */
  public async login(username: string, password: string): Promise<SuperAdmin> {
    try {
      // Check if the username already exists
      const existingUser = await this.drizzle.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.username, username),
      });

      if (!existingUser) {
        this.logger.error(`Admin ${username} not found`);
        throw new HttpException(
          `Admin ${username} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password,
      );

      if (!isPasswordValid) {
        this.logger.error(` Admin ${username} password is incorrect`);
        throw new HttpException(
          `Admin ${username} password is incorrect`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Generate access and refresh tokens
      const payload = { sub: existingUser.id, username: existingUser.username };
      const refreshPayload = { sub: existingUser.id };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(refreshPayload);

      // Log the login of the super admin
      this.logger.log(` Admin ${username} logged in`);

      // Fetch profile
      const profile = await this.drizzle.query.profileSchema.findFirst({
        where: (profiles, { eq }) => eq(profiles.user_id, existingUser.id),
      });

      return {
        id: existingUser.id,
        role: existingUser.role,
        username: existingUser.username,
        access_token: accessToken,
        refresh_token: refreshToken,
        name: profile?.name || existingUser.username,
        email: profile?.email || '',
        department: profile?.department || existingUser.department || '',
        position: profile?.position || '',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @author thatzerroguy
   * @description: This method is used to create regular admin.
   * @details: This method can only be called by the super admin.
   * @param {string} username - The username of the admin to be created.
   * @param {string} password - The password of the admin to be created.
   * @returns {Promise<Admin>} - The created admin.
   */
  public async createAdmin(
    user_id: string,
    username: string,
    password: string,
  ): Promise<Profile> {
    try {
      // Check if user creating the account is a super admin
      const user = await this.drizzle.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.id, user_id),
        columns: {
          role: true,
        },
      });
      if (
        !user ||
        (user.role as string).toUpperCase() !== UserRole.SUPER_ADMIN
      ) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      // Resolve Department
      let departmentId: string;
      const deptName = 'IT';
      const existingDept = await this.drizzle.query.departmentSchema.findFirst({
        where: (depts, { eq }) => eq(depts.name, deptName),
      });

      if (existingDept) {
          departmentId = existingDept.id;
      } else {
          const [newDept] = await this.drizzle
              .insert(departmentSchema)
              .values({ name: deptName })
              .returning();
          departmentId = newDept.id;
      }

      // Create admin
      const result = await this.drizzle
        .insert(userSchema)
        .values({
          username,
          password,
          role: 'ADMIN',
          department: deptName,
          department_id: departmentId,
        })
        .returning({
          id: userSchema.id,
          role: userSchema.role,
          username: userSchema.username,
        });
      const admin = result[0];

      // Create profile
      const profileResult = await this.drizzle
        .insert(profileSchema)
        .values({
          user_id: admin.id,
          name: 'Admin',
          email: 'admin@example.com',
          department: deptName,
          position: 'Admin',
        })
        .returning({
          name: profileSchema.name,
          email: profileSchema.email,
          department: profileSchema.department,
          position: profileSchema.position,
        });
      const profile = profileResult[0];

      // Generate access and refresh tokens
      const payload = { sub: admin.id, username: admin.username };
      const refreshPayload = { sub: admin.id };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(refreshPayload);

      return {
        id: admin.id,
        role: admin.role,
        username: admin.username,
        access_token: accessToken,
        refresh_token: refreshToken,
        name: profile.name,
        email: profile.email,
        department: profile.department,
        position: profile.position,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
