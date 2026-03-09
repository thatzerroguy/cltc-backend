import * as common from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type Role =
  | 'super_admin'
  | 'admin'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'STAFF'
  | 'HOD'
  | 'DG'
  | 'SECRETARY'
  | 'SCHOOL_COORDINATOR'
  | 'COURSE_INSTRUCTOR';
export const Roles = (...roles: Role[]) => common.SetMetadata(ROLES_KEY, roles);
