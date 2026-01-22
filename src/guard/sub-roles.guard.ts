import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUB_ROLES_KEY, SubRole } from '../decorator/sub-roles.decorator';

@Injectable()
export class SubRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredSubRoles = this.reflector.getAllAndOverride<SubRole[]>(
      SUB_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredSubRoles) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { sub_role: SubRole } }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    return requiredSubRoles.includes(user.sub_role);
  }
}
