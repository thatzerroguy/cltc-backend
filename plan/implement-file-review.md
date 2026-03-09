# Plan: Implement File Review and Workflow System

## Current Understanding
The goal is to implement a system for reviewing files, tracking their status as they move between departments, and assigning a final status.
The workflow involves:
1.  **Review:** A user (likely a department head) reviews a file currently in their department.
2.  **Status Assignment:** The reviewer assigns a status to the *current step* (`approved`, `returned`).
3.  **Forwarding:**
    -   If `approved`, the file might go to the *next* department (if one exists/is specified) or complete the workflow.
    -   If `returned`, the file might go back to the *previous* department or origin.
4.  **Final Status:** The file itself has a global status (`draft`, `in_circulation`, `completed`, `rejected`).

**Key Decisions/Assumptions:**
-   **Review Action:** A single endpoint `POST /files/:id/review` will handle the logic.
-   **Workflow Logic:**
    -   We need to determine "What is next?".
    -   *Assumption:* The user providing the review *decides* the next step if it's not pre-defined. Or, simpler:
        -   **Approve & Forward:** User approves and selects the *next* department.
        -   **Approve & Finalize:** User approves and marks the file as `completed`.
        -   **Return:** User returns the file (goes back to previous step or origin).
-   **Role:** Only department heads (`head` sub_role) or admins should be able to review? The prompt says "approved by the uploaded department head... approved by head of other department".
    -   *Constraint:* We need to check if the user is a `head` AND belongs to the `current_department_id` of the file.

## Step-by-Step Plan

- [x] **Create DTO**
    - [x] `ReviewFileDto`:
        -   `action`: Enum (`approve`, `return`, `reject`).
        -   `comments`: string.
        -   `nextDepartmentId`: UUID (optional, required if `action` is `approve` and not finalizing).
        -   `isFinal`: boolean (optional, true if this completes the workflow).

- [x] **Update `FilesService`**
    - [x] Implement `reviewFile(fileId, user, dto)` method.
    - [x] **Logic:**
        1.  **Fetch File:** Get file with current step info.
        2.  **Validation:**
            -   File exists?
            -   Is file in `in_circulation`?
            -   **Auth:** Is user part of `current_department_id`? Is user a `head` (or admin)?
        3.  **Update Current Step:**
            -   Update `workFlowSchema` entry: `status` = `approved` (or returned/rejected), `completed_at` = now, `comments` = dto.comments.
        4.  **Handle Action:**
            -   **If Approve & Forward:**
                -   Create *new* `workFlowSchema` entry for `nextDepartmentId`.
                -   Update `fileSchema`: `current_department_id` = `nextDepartmentId`, `current_step_id` = new step ID.
            -   **If Approve & Finalize:**
                -   Update `fileSchema`: `status` = `completed`.
            -   **If Return:**
                -   Update `fileSchema`: `status` = `rejected` (or move back to origin? Let's assume `rejected` for now or create a return step back to origin).
                -   *Decision:* For simplicity, `return` might just mark the step as `returned` and file status as `rejected` or `in_circulation` but pointing back to origin. Let's go with "Return to Origin" logic -> Create step for `origin_department_id`.
        5.  **Log:** Create `fileLogSchema` entry.

- [x] **Update `FilesController`**
    - [x] Endpoint: `POST /files/:id/review`
    - [x] Auth: `JwtAuthGuard`, `RolesGuard`.
    - [x] Logic: Call service.

- [x] **Verification**
    -   [x] Check types/build.
