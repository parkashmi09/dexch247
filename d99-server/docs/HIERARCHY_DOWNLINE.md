# Hierarchy & Downline System

## Overview
The platform operates on a strict hierarchical structure where each staff member (except the Owner) reports to a parent. This structure is crucial for commission distribution, risk management, and access control.

## Hierarchy Levels
The hierarchy is defined by the `Role` model and enforced via `level` (lower number = higher rank).

1.  **OWNER** (Level 1) - Top of the chain.
2.  **SUPERADMIN** (Level 2)
3.  **ADMIN** (Level 3)
4.  **SUBADMIN** (Level 4)
5.  **SUPERMASTER** (Level 5)
6.  **MASTER** (Level 6)
7.  **AGENT** (Level 7)
8.  **USER** (Level 8) - The end-user who places bets.

## Models

### `Staff` Model (`model/admin/Staff.js`)
Represents all admin/staff users.
- **`parent_id`**: Links to the superior staff member.
- **`role`**: The role name (e.g., 'MASTER').
- **`level`**: The numeric level derived from the role.
- **`percentage`**: Profit share percentage.

### `User` Model (`model/user/User.js`)
Represents the betting customers.
- **`parent_staff_id`**: Links to the Agent/Master who created the user.

## Routes & Controllers

### Staff Management Routes
**File:** `routes/admin/staffRoutes.js`
**Controller:** `controller/admin/StaffController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/staff/create-staff` | `createStaff` | Creates a new staff member under a parent. Validates hierarchy rules. |
| `GET` | `/staff/get-all-staff` | `getAllStaff` | Fetches all staff members. |
| `GET` | `/staff/get-staff-by-id/:id` | `getStaffById` | Fetches a single staff member with parent and children details. |
| `GET` | `/staff/get-staff-by-role-id/:role` | `getStaffByRole` | Fetches staff filtered by role. |
| `GET` | `/staff/get-staff-by-parent-id/:parentId` | `getStaffUnderParent` | Fetches direct reports of a specific parent. |
| `PATCH` | `/staff/update-staff/:id` | `updateStaff` | Updates staff details (role, password, percentage). |
| `DELETE` | `/staff/delete-staff/:id` | `deleteStaff` | Soft deletes staff and reassigns children to the deleted staff's parent. |

### User Management Routes (Downline)
**File:** `routes/admin/userRoutes.js`
**Controller:** `controller/admin/userController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/create-under-parent` | `createUserUnderParent` | Creates a User under a specific Staff member. |
| `GET` | `/users/all-details` | `getUserAllDetails` | Fetches detailed user list (balance, exposure, etc.). |
| `GET` | `/search-by-username` | `searchUsersByUsername` | Search for users. |
| `PUT` | `/staff-user-update` | `updateStaffAndUser` | Updates user status or password by staff. |

### Controller Functions
**File:** `controller/admin/StaffController.js`

- **`createStaff(req, res)`**:
  - Validates inputs and password strength.
  - Checks `validateHierarchy` and `validateParent` middlewares.
  - Creates `Staff` record.
  - Creates initial `Wallet` for the new staff.
  - Commits transaction.

- **`deleteStaff(req, res)`**:
  - Handles hierarchy repair: Children of the deleted staff are moved up to the deleted staff's parent (`parent_id` update).
  - Soft deletes the staff record.

**File:** `controller/admin/userController.js`

- **`createUserUnderParent(req, res)`**:
  - Creates a `User` record linked to `parent_staff_id`.
  - Creates a `Wallet` for the user.
