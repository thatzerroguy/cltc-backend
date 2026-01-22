import * as common from '@nestjs/common';

export const SUB_ROLES_KEY = 'sub_roles';
export type SubRole = 'head' | 'manager' | 'employee';
export const SubRoles = (...subRoles: SubRole[]) =>
  common.SetMetadata(SUB_ROLES_KEY, subRoles);
