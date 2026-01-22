import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Explicitly mock bcrypt functions
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let drizzleMock: any;
  let jwtServiceMock: any;
  let configServiceMock: any;

  // Mock Data
  const mockSuperAdmin = {
    id: 'uuid-super-admin',
    username: 'superadmin',
    password: 'hashed_password',
    role: 'super_admin',
  };

  const mockTokens = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup Drizzle Mock with Builder Pattern
    const returningMock = jest.fn();
    const valuesMock = jest.fn(() => ({ returning: returningMock }));

    drizzleMock = {
      query: {
        userSchema: {
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn(() => ({ values: valuesMock })),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock_token'),
    };

    configServiceMock = {
      get: jest.fn((key: string) => {
        const config = {
          'jwt.refresh.secret': 'test_refresh_secret',
          'jwt.refresh.expiresIn': '7d',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'DRIZZLE',
          useValue: drizzleMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSuperAdmin', () => {
    const createDto = { username: 'superadmin', password: 'password123' };

    it('should_return_super_admin_with_tokens_when_creation_successful', async () => {
      // Arrange
      drizzleMock.query.userSchema.findFirst.mockResolvedValue(null); // No existing user
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock insert chain: insert().values().returning() -> [mockSuperAdmin]
      const returningMock = jest.fn().mockResolvedValue([mockSuperAdmin]);
      const valuesMock = jest.fn(() => ({ returning: returningMock }));
      drizzleMock.insert.mockReturnValue({ values: valuesMock });

      jwtServiceMock.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);

      // Act
      const result = await service.createSuperAdmin(
        createDto.username,
        createDto.password,
      );

      // Assert
      expect(result).toEqual({
        id: mockSuperAdmin.id,
        role: mockSuperAdmin.role,
        username: mockSuperAdmin.username,
        access_token: mockTokens.accessToken,
        refresh_token: mockTokens.refreshToken,
      });

      // Security & Argument Assertions
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(drizzleMock.insert).toHaveBeenCalled();
      expect(valuesMock).toHaveBeenCalledWith({
        username: createDto.username,
        password: 'hashed_password',
        role: 'super_admin',
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: mockSuperAdmin.id,
        username: mockSuperAdmin.username,
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        { sub: mockSuperAdmin.id },
        expect.objectContaining({
          secret: 'test_refresh_secret',
          expiresIn: '7d',
        }),
      );
    });

    it('should_throw_conflict_exception_when_username_exists', async () => {
      // Arrange
      drizzleMock.query.userSchema.findFirst.mockResolvedValue(mockSuperAdmin); // User exists

      // Act & Assert
      await expect(
        service.createSuperAdmin(createDto.username, createDto.password),
      ).rejects.toThrow(
        new HttpException('Username already exists', HttpStatus.CONFLICT),
      );
      expect(drizzleMock.insert).not.toHaveBeenCalled();
    });

    it('should_throw_internal_server_error_when_db_fails', async () => {
      // Arrange
      drizzleMock.query.userSchema.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const returningMock = drizzleMock.insert().values().returning;
      returningMock.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(
        service.createSuperAdmin(createDto.username, createDto.password),
      ).rejects.toThrow(
        new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('login', () => {
    const loginDto = { username: 'superadmin', password: 'password123' };

    it('should_return_user_with_tokens_when_credentials_valid', async () => {
      // Arrange
      drizzleMock.query.userSchema.findFirst.mockResolvedValue(mockSuperAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtServiceMock.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);

      // Act
      const result = await service.login(loginDto.username, loginDto.password);

      // Assert
      expect(result.access_token).toBe(mockTokens.accessToken);
      expect(result.refresh_token).toBe(mockTokens.refreshToken);

      // Security Assertions
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockSuperAdmin.password,
      );
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: mockSuperAdmin.id,
        username: mockSuperAdmin.username,
      });
    });

    it('should_throw_not_found_exception_when_user_does_not_exist', async () => {
      // Arrange
      drizzleMock.query.userSchema.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login(loginDto.username, loginDto.password),
      ).rejects.toThrow(
        new HttpException(
          `Admin ${loginDto.username} not found`,
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should_throw_unauthorized_exception_when_password_invalid', async () => {
      // Arrange
      drizzleMock.query.userSchema.findFirst.mockResolvedValue(mockSuperAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.login(loginDto.username, loginDto.password),
      ).rejects.toThrow(
        new HttpException(
          `Admin ${loginDto.username} password is incorrect`,
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
  });

  describe('createAdmin', () => {
    const newAdminDto = { username: 'newadmin', password: 'password123' };
    const requesterId = 'uuid-super-admin';

    const mockNewAdmin = {
      id: 'uuid-new-admin',
      username: 'newadmin',
      role: 'admin',
    };

    const mockProfileData = {
      name: 'Admin',
      email: 'admin@example.com',
      department: 'IT',
      position: 'Admin',
    };

    it('should_create_admin_and_profile_when_caller_is_super_admin', async () => {
      // Arrange
      // 1. Check requester role (returning super_admin)
      drizzleMock.query.userSchema.findFirst.mockResolvedValue({
        role: 'super_admin',
      });

      // 2. Insert User (chained mock)
      const returningUserMock = jest.fn().mockResolvedValue([mockNewAdmin]);
      const valuesUserMock = jest.fn(() => ({ returning: returningUserMock }));

      // 3. Insert Profile (chained mock)
      const returningProfileMock = jest
        .fn()
        .mockResolvedValue([mockProfileData]);
      const valuesProfileMock = jest.fn(() => ({
        returning: returningProfileMock,
      }));

      // Setup insert to handle multiple calls (first user, then profile)
      drizzleMock.insert
        .mockReturnValueOnce({ values: valuesUserMock })
        .mockReturnValueOnce({ values: valuesProfileMock });

      jwtServiceMock.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);

      // Act
      const result = await service.createAdmin(
        requesterId,
        newAdminDto.username,
        newAdminDto.password,
      );

      // Assert
      expect(result.role).toBe('admin');
      expect(result.email).toBe(mockProfileData.email);
      expect(drizzleMock.insert).toHaveBeenCalledTimes(2);

      // Data Integrity Assertions
      expect(valuesUserMock).toHaveBeenCalledWith({
        username: newAdminDto.username,
        password: newAdminDto.password,
        role: 'admin',
      });
      expect(valuesProfileMock).toHaveBeenCalledWith({
        user_id: mockNewAdmin.id,
        name: 'Admin',
        email: 'admin@example.com',
        department: 'IT',
        position: 'Admin',
      });
    });

    it('should_throw_unauthorized_exception_when_caller_not_found', async () => {
      // Arrange
      drizzleMock.query.userSchema.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createAdmin(
          requesterId,
          newAdminDto.username,
          newAdminDto.password,
        ),
      ).rejects.toThrow(
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should_throw_unauthorized_exception_when_caller_is_not_super_admin', async () => {
      // Arrange
      drizzleMock.query.userSchema.findFirst.mockResolvedValue({
        role: 'admin',
      });

      // Act & Assert
      await expect(
        service.createAdmin(
          requesterId,
          newAdminDto.username,
          newAdminDto.password,
        ),
      ).rejects.toThrow(
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should_throw_internal_server_error_when_config_missing', () => {
      // Arrange
      configServiceMock.get.mockReturnValue(undefined);

      // Act & Assert
      expect(() => {
        service.generateRefreshToken({ sub: '123' });
      }).toThrow(
        new HttpException(
          'JWT refresh secret or expires in not found in config',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
