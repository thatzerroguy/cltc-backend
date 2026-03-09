# Plan: Create Department Logic

## Current Understanding
The goal is to implement the functionality to create a new department.
Crucially, this action must be restricted to users with the `super_admin` role.
We have an existing `DepartmentService` with a placeholder comment, an empty `DepartmentController`, and established RBAC mechanisms (`RolesGuard`, `Roles` decorator).

## Step-by-Step Plan

- [x] **Create DTO**
    - [x] Create `src/department/dto/create-department.dto.ts`.
    - [x] Add `name` field with validation (string, not empty).

- [x] **Update `DepartmentService`**
    - [x] Implement `createDepartment` method.
    - [x] Input: `CreateDepartmentDto` (and potentially user ID if needed for auditing, though the requirement just says "create by super admin").
    - [x] Logic:
        - [x] Check if department with same name already exists (schema has unique constraint, but explicit check is good for error messages).
        - [x] Insert new department into `departmentSchema`.
        - [x] Return the created department.

- [x] **Update `DepartmentController`**
    - [x] Add `POST /department` endpoint.
    - [x] Use `Roles('super_admin')` decorator to restrict access.
    - [x] Use `UseGuards(JwtAuthGuard, RolesGuard)` (Assuming `JwtAuthGuard` exists, need to verify or import it).
    - [x] call `departmentService.createDepartment`.

- [x] **Verification**
    - [x] Ensure `pnpm run build` passes.
