import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorator/roles.decorator';

interface RequestWithUser {
  user: {
    id: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('super-admin')
  createSuperAdmin(@Body() createUserDto: CreateUserDto) {
    return this.authService.createSuperAdmin(
      createUserDto.username,
      createUserDto.password,
    );
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Post('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('super_admin', 'SUPER_ADMIN')
  createAdmin(
    @Req() req: RequestWithUser,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.authService.createAdmin(
      req.user.id,
      createUserDto.username,
      createUserDto.password,
    );
  }
}
