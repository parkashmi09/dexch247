# First Time Login Password Reset

## Overview
This feature enforces a security policy where new users (Staff and Owners) must reset their password upon their very first login. Until the password is changed, they are restricted from accessing the dashboard and other protected routes.

## Database Changes

### Models
Two models were updated to include a tracking flag:

1.  **Owner Model** (`model/admin/Owner.js`)
    *   Added column: `first_login`
    *   Type: `BOOLEAN`
    *   Default: `false`

2.  **Staff Model** (`model/admin/Staff.js`)
    *   Added column: `first_login`
    *   Type: `BOOLEAN`
    *   Default: `false`

*Note: `false` indicates the user has NOT yet completed their first login password reset (i.e., it is their "first login" state). Once reset, it becomes `true`.*

## Backend Implementation

### Authentication
The login response now includes the `first_login` status of the user.

*   **Controllers**: `OwnerAuthController` and `StaffAuthController` were updated to pass the `first_login` field from the service response to the API response.
*   **Services**: `OwnerAuthService` and `StaffAuthService` were updated to include `first_login` in the user object returned upon successful authentication.

### Password Update
*   **Controller**: `StaffController.js` -> `updateStaffPassword`
*   **Logic**: When a user successfully updates their password via the `/admin/staff-update-password` endpoint, the `first_login` flag is automatically set to `true`.

## Frontend Implementation

### Login Logic (`Login.jsx`)
Upon successful login, the application checks the `first_login` flag in the response:
*   If `first_login === false`: User is redirected to `/reset-password`.
*   If `first_login === true`: User is redirected to the dashboard (`/admin/market-analysis`).

### Route Protection
To prevent users from bypassing the reset screen by navigating directly to other URLs:

1.  **App Routing (`App.jsx`)**:
    *   The root (`/`) and login (`/login`) routes now conditionally redirect authenticated users based on their `first_login` status.

2.  **Protected Routes (`ProtectedRoute.jsx`)**:
    *   A check was added to the `ProtectedRoute` component.
    *   If an authenticated user has `first_login === false`, they are immediately redirected to `/reset-password`, blocking access to any protected pages.

## User Flow

1.  **Admin/Owner creates a new user.**
    *   The new user is created with `first_login = false` (default).
2.  **User logs in for the first time.**
    *   The API returns `success: true` and `first_login: false`.
    *   Frontend detects this and redirects the user to the **Change Password** page.
3.  **User resets password.**
    *   User enters old password and new password.
    *   Backend validates the request and updates the password.
    *   Backend sets `first_login = true`.
4.  **User logs in again (or is redirected).**
    *   The API returns `success: true` and `first_login: true`.
    *   Frontend redirects the user to the **Dashboard**.
