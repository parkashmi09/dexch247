
# Server Architecture

## Overview
The D247 Server is a Node.js application built using the Express framework. It serves as the backend for the betting platform, handling user management, betting logic, wallet transactions, and real-time updates.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure
## Project Structure
The project follows a standard MVC (Model-View-Controller) structure:

### Root Directory
- **`server.js`**: The entry point. Initializes Express, connects to DB, sets up Socket.IO, and mounts routes.
- **`package.json`**: Dependency definitions.

### `config/`
- **`db.js`**: Sequelize instance and database connection logic.
- **`dbInit.js`**: Handles database synchronization and seeding (initial data).

### `model/`
Sequelize models defining the database schema.
- **`admin/`**:
    - `Staff.js`: Admin/Staff accounts.
    - `Wallet.js`: Financial records.
    - `Role.js`: Hierarchy definitions.
    - `PlatformGames.js`: Global game settings.
- **`user/`**:
    - `User.js`: End-user accounts.
    - `SportsBet.js`: Betting records.
    - `CreditsLedger.js`: Commission tracking.

### `controller/`
Business logic handlers.
- **`admin/`**:
    - `walletController.js`: Financial operations.
    - `betLockController.js`: Locking logic.
    - `riskManagementController.js`: Risk monitoring.
- **`sports/`**:
    - `cricketController.js`: Sports betting logic.

### `routes/`
API route definitions mapping URLs to controllers.
- **`admin/`**: Admin panel endpoints (e.g., `adminWalletRoutes.js`, `staffRoutes.js`).
- **`user/`**: Betting site endpoints (e.g., `userWalletRoutes.js`, `gamesRoutes.js`).

### `middleware/`
- `authMiddleware.js`: JWT authentication.
- `ruleMiddleware.js`: Hierarchy and permission enforcement.

### `services/`
Reusable business logic, separated from controllers.
- `walletService.js`: Core wallet transaction logic.
- `CricketService.js`: External API integration for sports data.

### `jobs/`
Scheduled background tasks.
- `dailyProfitLossJob.js`: Calculates and snapshots daily P/L.

## Core Components

### Database Initialization
The `config/dbInit.js` script handles the database synchronization and seeding. It ensures that all tables exist and populates initial data like Roles and Fixed Platform Games.

### Real-time Updates
Socket.IO is used for real-time communication, allowing the server to push updates to connected clients (e.g., live match odds, bet status).

### Cron Jobs
Scheduled tasks run in the background to perform maintenance or periodic calculations. For example, `jobs/dailyProfitLossJob.js` runs daily to calculate and snapshot profit/loss data.
