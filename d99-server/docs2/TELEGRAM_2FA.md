# Telegram 2FA Implementation Documentation

## Overview
The Telegram 2FA system provides a secure second layer of authentication for users. Instead of traditional SMS or Authenticator apps, this system uses a Telegram Bot to send One-Time Passwords (OTPs).

The flow consists of three main parts:
1.  **Linking**: User connects their Telegram account to their platform account.
2.  **Login**: User logs in with password, then receives an OTP on Telegram to complete login.
3.  **Management**: User can disable 2FA (requires OTP verification) from their profile.

## 1. Prerequisites & Configuration

### Environment Variables (.env)
The following variables are required in `d99-server/.env`:
- `TELEGRAM_BOT_TOKEN`: The API token obtained from @BotFather.
- `PROJECT_BASE_URL`: The public URL of the website (used for webhook setup, though currently using polling/direct updates).

### Database Model (User)
The `User` model (`d99-server/model/user/User.js`) has been updated with:
- `telegramChatId` (String): Stores the linked Telegram Chat ID.
- `telegram2FAEnabled` (Boolean): Flag to check if 2FA is active.

## 2. Architecture & Components

### Backend (`d99-server`)

#### Bot Service (`2FA_telegram_bot/index.js`)
- Initializes a Telegram bot instance.
- Handles the `/start` command.
- Handles the `/connect <code>` command to link accounts.
- Provides `sendOTP(chatId, otp)` functionality.

#### Controller (`controller/user/telegram2faController.js`)
Handles the logic for 2FA operations:
- `verifyPassword`: Verifies login password before allowing 2FA setup.
- `generateLinkCode`: Creates a temporary code for the user to send to the bot.
- `verifyLinkWebhook`: (Triggered by Bot) Verifies the code and links the `chatId` to the user.
- `sendDisableCode`: Generates and sends an OTP to Telegram for disabling 2FA.
- `disable2FA`: Verifies the OTP and disables 2FA for the user.

#### Auth Service (`services/user/userAuthService.js`)
- `verify2FA`: Checks the OTP entered by the user during login.
- `resend2FA`: Resends the OTP during the login challenge.

### Frontend (`d99-frontend`)

#### Pages & Components
- **`SecurityAuth` (`components/securityAuth/index.js`)**:
    - The main settings page for enabling/disabling 2FA.
    - **Enable Flow**:
        1.  Verify Password.
        2.  Generate Connection ID.
        3.  User sends `/connect <ID>` to bot.
    - **Disable Flow**:
        1.  Shows "Enabled" status.
        2.  Click "Enabled" -> "Get Code".
        3.  Enter 6-digit OTP -> 2FA is specific.
- **`TwoFactorAuth` (`pages/authentication/TwoFactorAuth.js`)**:
    - The screen shown after successful password login if 2FA is enabled.
    - Accepts 6-digit OTP.
    - Auto-submits on completion.

## 3. API Endpoints

### 2FA Setup & Management

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/user/verify-password` | Verify login password before setup | `{ password }` |
| `GET` | `/api/2fa/telegram/generate-link-code` | Get unique code for bot linking | - |
| `POST` | `/api/2fa/telegram/webhook/link` | (Internal) web hook for bot to link user | `{ code, chatId }` |
| `POST` | `/api/user/send-disable-code` | Send OTP to disable 2FA | - |
| `POST` | `/api/user/disable-2fa` | Disable 2FA with OTP | `{ otp }` |

### Login & Verification

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/user/verify-2fa` | Verify OTP to complete login | `{ userId, otp }` |
| `POST` | `/api/user/resend-2fa-otp` | Resend Login OTP | `{ userId }` |

## 4. Usage Flow

### Enabling 2FA
1.  User navigates to **Security Auth**.
2.  Enters login **Password** -> Verify.
3.  Clicks **"Using Telegram"** -> **"Get Connection ID"**.
4.  Server generates a code (e.g., `123456`).
5.  User opens Telegram bot and types `/connect 123456`.
6.  Bot notifies server -> Server saves `chatId` and sets `telegram2FAEnabled = true`.
7.  Frontend updates to show "Enabled".

### Logging In
1.  User enters Username & Password on Login screen.
2.  Server checks password. If correct AND `telegram2FAEnabled` is true:
    - Server generates OTP (e.g., `999999`).
    - Sends OTP to User's Telegram.
    - Returns `{ require2FA: true, userId: ... }`.
3.  Frontend redirects to `/authentication/2`.
4.  User enters `999999`.
5.  Frontend calls `/verify-2fa`.
6.  Server validates OTP -> Returns JWT Token.
7.  User is logged in.

### Disabling 2FA
1.  User navigates to **Security Auth** (Status: Enabled).
2.  Clicks **"Enabled"** badge (or "Get Code").
3.  Server sends OTP to Telegram.
4.  User enters OTP in the inputs.
5.  Frontend calls `/disable-2fa`.
6.  Server validates OTP -> Sets `telegram2FAEnabled = false` and clears `chatId`.
7.  Frontend updates to show "Disabled".
