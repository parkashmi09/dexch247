# Authentication System

## Overview
The authentication system uses JWT (JSON Web Tokens) for secure access. There are separate flows for Staff/Admin/Owner and regular Users.

## Models
- **`Staff`**: Admin, Agents, Masters, etc.
- **`User`**: End-users.
- **`TokenBlacklist`**: Stores invalidated tokens (for logout).

## Routes & Controllers

### Staff Authentication (Admin Panel)
**File:** `routes/admin/staffAuthRoutes.js`
**Controller:** `controller/admin/staffAuthController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/staff/login` | `login` | Authenticates staff using email/password. Returns JWT. |
| `POST` | `/staff/logout` | `logout` | Invalidates the current token by adding it to the blacklist. |

### User Authentication (Betting Site)
**File:** `routes/user/userAuthRoutes.js`
**Controller:** `controller/user/userAuthController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | `login` | Authenticates user using username/password. Returns JWT. |
| `POST` | `/logout` | `logout` | Invalidates the current token. |

## Controller Functions

### `StaffAuthController` (`controller/admin/staffAuthController.js`)
- **`login(req, res)`**:
  - Validates email and password.
  - Calls `StaffAuthService.login(email, password)`.
  - Returns `{ success: true, token: ... }`.

- **`logout(req, res)`**:
  - Extracts token from header.
  - Calls `StaffAuthService.logout(token)`.

### `UserAuthController` (`controller/user/userAuthController.js`)
- **`login(req, res)`**:
  - Validates username and password.
  - Calls `UserAuthService.login(username, password)`.
  - Returns `{ success: true, token: ... }`.

- **`logout(req, res)`**:
  - Similar to staff logout, invalidates the user token.

## Services
- **`StaffAuthService`**: Handles password hashing verification and JWT generation for staff.
- **`UserAuthService`**: Handles password hashing verification and JWT generation for users.
