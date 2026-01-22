import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    createSuperAdmin: jest.fn(),
    login: jest.fn(),
    createAdmin: jest.fn(),
  };

  const mockResponse = {
    id: 'uuid',
    username: 'testuser',
    role: 'super_admin',
    access_token: 'access_token',
    refresh_token: 'refresh_token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSuperAdmin', () => {
    it('should call authService.createSuperAdmin and return result', async () => {
      const dto: CreateUserDto = {
        username: 'superadmin',
        password: 'password123',
      };

      mockAuthService.createSuperAdmin.mockResolvedValue(mockResponse);

      const result = await controller.createSuperAdmin(dto);

      expect(authService.createSuperAdmin).toHaveBeenCalledWith(
        dto.username,
        dto.password,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto: LoginDto = {
        username: 'superadmin',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(
        dto.username,
        dto.password,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createAdmin', () => {
    it('should call authService.createAdmin with requester ID', async () => {
      const dto: CreateUserDto = {
        username: 'admin',
        password: 'password123',
      };
      const req = {
        user: {
          id: 'requester-uuid',
        },
      };

      const mockAdminResponse = {
        ...mockResponse,
        role: 'admin',
        name: 'Admin Profile',
        email: 'admin@example.com',
        department: 'IT',
        position: 'Admin',
      };

      mockAuthService.createAdmin.mockResolvedValue(mockAdminResponse);

      const result = await controller.createAdmin(req, dto);

      expect(authService.createAdmin).toHaveBeenCalledWith(
        req.user.id,
        dto.username,
        dto.password,
      );
      expect(result).toEqual(mockAdminResponse);
    });
  });
});
