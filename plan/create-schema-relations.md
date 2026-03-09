# Plan: Create Schema Relations

## Current Understanding

The goal is to define Drizzle ORM relations for the existing schemas to model the application's data structure correctly.
The requested relations are:

1.  **Departments <-> Users**: One-to-Many (1:N)
2.  **Users <-> Files**: One-to-Many (1:N)
3.  **Files <-> Workflow Steps**: One-to-Many (1:N)
4.  **Departments <-> Workflow Steps**: One-to-Many (1:N)
5.  **Files <-> File Logs**: One-to-Many (1:N)
6.  **Departments <-> Files (Origin)**: One-to-Many (1:N)

Existing schemas: `departments`, `users`, `files`, `workflows`, `file_logs`.
Some foreign keys are already defined in the tables. Some relations are partially defined in `departments` and `users`.

## Step-by-Step Plan

- [x] **Update `src/database/schema/departments.schema.ts`**
  - [x] Update `departmentRelations` to include:
    - `workflowSteps`: Many `workFlowSchema`
    - `files`: Many `fileSchema` (representing files originating from this department)

- [x] **Update `src/database/schema/file.schema.ts`**
  - [x] Import `relations` from `drizzle-orm`.
  - [x] Import `userSchema`, `departmentSchema`, `workFlowSchema`, `fileLogSchema`.
  - [x] Define `fileRelations`:
    - `creator`: One `userSchema` (fields: `creator_id`, references: `userSchema.id`)
    - `originDepartment`: One `departmentSchema` (fields: `origin_department_id`, references: `departmentSchema.id`)
    - `workflowSteps`: Many `workFlowSchema`
    - `logs`: Many `fileLogSchema`

- [x] **Update `src/database/schema/workflow.schema.ts`**
  - [x] Import `relations` from `drizzle-orm`.
  - [x] Import `fileSchema`, `departmentSchema`.
  - [x] Define `workflowRelations`:
    - `file`: One `fileSchema` (fields: `file_id`, references: `fileSchema.id`)
    - `department`: One `departmentSchema` (fields: `department_id`, references: `departmentSchema.id`)

- [x] **Update `src/database/schema/file-log.schema.ts`**
  - [x] Import `relations` from `drizzle-orm`.
  - [x] Import `fileSchema`.
  - [x] Define `fileLogRelations`:
    - `file`: One `fileSchema` (fields: `file_id`, references: `fileSchema.id`)

- [x] **Review `src/database/schema/user.schema.ts`**
  - [x] Ensure `userRelations` includes `files` (Already seems to exist, verify correctness).

- [x] **Verification**
  - [x] Run `pnpm run build` to ensure type safety.
  - [ ] (Optional) Run `pnpm run db:generate` to check if drizzle-kit accepts the schema changes (though relations are application-level, not always SQL-level).
