# Middleware Documentation

## Overview
Middlewares are functions that execute during the request-response cycle. They handle authentication, authorization, and data validation.

## Core Middlewares

### 1. Authentication Middleware
**File:** `middleware/authMiddleware.js`
**Function:** `authMiddleware`

- **Purpose**: Verifies the JWT token sent in the `Authorization` header.
- **Logic**:
    1.  **Extraction**: Gets token from `req.header('Authorization')`.
    2.  **Blacklist Check**: Verifies if the token is in the `TokenBlacklist` (logged out).
    3.  **Verification**: Uses `jwt.verify` with `process.env.JWT_SECRET`.
    4.  **User Attachment**: Decodes the token and attaches the payload (id, role, username, level) to `req.user`.
    5.  **Error Handling**: Returns 401 if token is missing, invalid, or expired.

### 2. Role-Based Access Control (RBAC)
**File:** `middleware/roleMiddleware.js`
**Function:** `roleMiddleware(allowedRoles)`

- **Purpose**: Restricts access to specific user roles.
- **Logic**:
    1.  Checks if `req.user` exists (must run after `authMiddleware`).
    2.  Checks if `req.user.role` is included in the `allowedRoles` array.
    3.  Returns 403 "Access denied" if the role is not authorized.

### 3. Rule & Hierarchy Middleware
**File:** `middleware/ruleMiddleware.js`
**Functions**:

#### `authorize(action)`
- **Purpose**: Granular permission checking based on named actions (e.g., 'CREATE_USER').
- **Logic**:
    1.  Looks up the `action` in `rules/rule.js`.
    2.  Checks if `req.user.role` has the required power/permission for that action.

#### `validateHierarchy`
- **Purpose**: Prevents staff from creating users/staff with a higher or equal rank.
- **Logic**:
    1.  Compares the numeric `level` of the logged-in user vs. the role they are trying to create.
    2.  **Rule**: `Creator Level` < `Target Level` (Lower number = Higher rank).
    3.  Example: A Master (Level 6) cannot create a SuperMaster (Level 5).

#### `validateParent`
- **Purpose**: Enforces the downline structure.
- **Logic**:
    1.  **For Owners**: Allows specifying any `parent_id`.
    2.  **For Others**: Forces `req.body.parent_id` to be the logged-in user's ID.
    3.  Ensures that a staff member can only create users directly under themselves.

## Global Middleware
**File:** `server.js`

- **Logger**: Logs `[METHOD] URL` for every incoming request.
- **CORS**: Configured to allow requests from specific frontend domains (defined in `.env` or hardcoded whitelist).
- **JSON Parser**: `express.json()` parses incoming JSON payloads.

