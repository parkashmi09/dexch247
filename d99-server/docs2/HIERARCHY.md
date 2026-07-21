# System Hierarchy and Data Isolation

## Overview
The system enforces a strict tree-based hierarchy to ensure data isolation and security. Users (Staff and Bettors) can only access data belonging to themselves and their direct descendants. Horizontal access (accessing data of siblings or other branches) is strictly prohibited.

## Role Hierarchy
The system uses a level-based hierarchy defined in `middleware/ruleMiddleware.js`:

| Role | Level | Description |
| :--- | :--- | :--- |
| **OWNER** | 0 | Root of the system. Has full access. |
| **COMPANY** | 1 | Top-level admin. |
| **SUPERADMIN** | 2 | |
| **ADMIN** | 3 | |
| **SUPERMASTER** | 4 | |
| **MASTER** | 5 | Direct parent of Users (Bettors). |
| **USER (BETTOR)** | 6 | End user who places bets. |

## Data Isolation Principles

### 1. Vertical Access (Allowed)
A staff member can access:
*   Their own data.
*   Data of staff members they created (Children).
*   Data of staff members created by their children (Grandchildren, etc.).
*   Users (Bettors) created by any of their descendants.

### 2. Horizontal Access (Denied)
A staff member **cannot** access:
*   Data of their siblings (Staff created by the same parent).
*   Data of users created by their siblings.
*   Data of their parent or ancestors.

## Implementation Details

### Creation (`validateHierarchy` Middleware)
When creating a new user or staff member:
1.  The system identifies the **Creator's Level**.
2.  The system identifies the **Target Role's Level**.
3.  **Rule**: The Creator's Level must be strictly lower (numerically) than the Target Level.
    *   *Example*: A `MASTER` (Level 5) cannot create another `MASTER` (Level 5) or an `ADMIN` (Level 3). They can only create a `USER` (Level 6).

### Read Access (`userController.js`)
When fetching data (e.g., `getUserAllDetails`):
1.  **Scope Calculation**: The system calculates the "Allowed Scope" for the logged-in user.
    *   Function: `getAllDescendantStaffIds(loggedInId)`
    *   This recursively fetches all staff IDs in the user's downline.
2.  **Filtering**: The database query is explicitly filtered using this scope.
    *   **Staff Data**: `WHERE staff_id IN (allowed_scope)`
    *   **User Data**: `WHERE parent_staff_id IN (allowed_scope)`

### Database Schema
*   **Staff Table**:
    *   `parent_id`: References the Staff member who created this account.
    *   `parent_owner_id`: References the Owner (if applicable).
*   **User Table**:
    *   `parent_staff_id`: References the Staff member who created this user.
    *   `parent_owner_id`: References the Owner (if created directly by owner).

## Example Scenario
*   **Admin A** creates **Master M1** and **Master M2**.
*   **Master M1** creates **User U1**.
*   **Master M2** creates **User U2**.

**Access Rights:**
*   **Admin A**: Can see M1, M2, U1, and U2.
*   **Master M1**: Can see U1. **Cannot** see M2 or U2.
*   **Master M2**: Can see U2. **Cannot** see M1 or U1.
