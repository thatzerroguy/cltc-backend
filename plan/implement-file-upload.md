# Plan: Implement File Upload and Tracking System

## Current Understanding
The goal is to implement a file upload system for `admin` and `super_admin` roles using NestJS and `multer`. The system needs to support a workflow where files can be approved by department heads, sometimes involving routing to other departments. This implies a need for a robust file tracking mechanism and workflow management.

**Key Requirements:**
1.  **File Upload:** Allow users (admin/super_admin) to upload files.
2.  **Workflow Initialization:** When a file is uploaded, a workflow should be created.
    -   Ideally, the uploader specifies the target department(s) or the initial approval step.
    -   "Most files can be approved by the uploaded department head" -> Implicit initial step?
    -   "Some will require to be approved by head of other department" -> User selects route?
3.  **Tracking:** The system must track where the file is (Current Department, Current Step).
4.  **Data Models:** We have `fileSchema`, `workFlowSchema`, and `fileLogSchema` which seem well-suited for this.

## Clarification Questions
1.  **Storage:** Where should the physical files be stored? Local disk (e.g., `./uploads`) or cloud storage (e.g., S3)? *Assumption for now: Local disk for simplicity, as no cloud provider was mentioned.*
2.  **Workflow Definition:** How does the uploader define the workflow?
    -   **Option A:** Simple "Send to Department X". The system creates a workflow step for Dept X.
    -   **Option B:** Pre-defined templates (e.g., "Leave Request" -> HR -> Finance).
    -   **Option C:** Dynamic list of departments.
    *Assumption: We will implement a simplified version of Option C/A: The user uploading the file specifies an initial target department (or it defaults to their own head), and potentially a sequence if needed, but let's start with "Upload + Assign to specific Department".*

## Step-by-Step Plan

- [x] **Setup Multer & File Module**
    - [x] Create `src/file/file.module.ts`, `src/file/file.controller.ts`, `src/file/file.service.ts` (Moved to `src/files` due to existing boilerplate).
    - [x] Install types for multer if not present (`pnpm add -D @types/multer`).
    - [x] Configure `MulterModule` in `FileModule` (destination: `./uploads`, file naming logic).

- [x] **Create DTOs**
    - [x] `UploadFileDto`:
        -   `name`: string (display name of the file)
        -   `targetDepartmentId`: string (UUID of the department to send the file to initially)
        -   `comments`: string (optional initial comment)

- [x] **Implement File Upload Endpoint**
    - [x] Endpoint: `POST /files/upload`
    - [x] Auth: `JwtAuthGuard`, `RolesGuard` (admin, super_admin).
    - [x] Interceptor: `FileInterceptor('file')`.
    - [x] Logic (`FileService.uploadFile`):
        -   Save file metadata to `fileSchema`.
        -   Set `creator_id` from logged-in user.
        -   Set `origin_department_id` from logged-in user's department.
        -   Set `current_department_id` to the `targetDepartmentId` (or origin if self-approval).
        -   **Create Workflow Step:** Create an initial entry in `workFlowSchema` for the target department with status `pending`.
        -   Update `fileSchema` with `current_step_id` of the created workflow step.
        -   **Log Action:** Create an entry in `fileLogSchema` ("File Uploaded").

- [x] **Implement Tracking/Workflow Logic**
    -   *Note: This might be a separate task, but the "upload" part implies setting the initial state.*
    -   Ensure the file status is set to `in_circulation` (or `draft` if it needs review before sending). Let's go with `in_circulation` if it's immediately sent.

- [x] **Verification**
    -   [x] Build passes.
    -   [ ] (Manual) Test uploading a file as an admin.
    -   [ ] (Manual) Verify file is on disk.
    -   [ ] (Manual) Verify database records: File, Workflow, Log.
