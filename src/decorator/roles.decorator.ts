import * as common from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type Role = 'super_admin' | 'admin';
export const Roles = (...roles: Role[]) => common.SetMetadata(ROLES_KEY, roles);
