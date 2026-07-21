# Password Service Documentation

## Overview

The `PasswordService` is a comprehensive utility service for handling password operations securely in your Node.js application. It provides functions for hashing, comparing, and validating passwords using bcrypt.

## Features

- **Password Hashing**: Secure password hashing with configurable salt rounds
- **Password Comparison**: Safe comparison of plain text passwords with hashed passwords
- **Salt Generation**: Generate cryptographic salts for password hashing
- **Password Strength Validation**: Validate password strength with customizable rules
- **Error Handling**: Comprehensive error handling with meaningful error messages
- **Type Safety**: Input validation to ensure proper data types

## Installation

The service uses `bcryptjs` which is already installed in your project. No additional installation is required.

## Usage

### Basic Import

```javascript
import PasswordService from './services/passwordService.js';
```

### 1. Hash a Password

```javascript
// Basic password hashing with default salt rounds (12)
const hashedPassword = await PasswordService.hashPassword('MySecurePassword123!');

// Custom salt rounds
const hashedPassword = await PasswordService.hashPassword('MySecurePassword123!', 10);
```

### 2. Compare Passwords

```javascript
// Compare a plain text password with a hashed password
const isMatch = await PasswordService.comparePassword('MySecurePassword123!', hashedPassword);
if (isMatch) {
    console.log('Password is correct!');
} else {
    console.log('Password is incorrect!');
}
```

### 3. Generate Salt

```javascript
// Generate salt with default rounds (12)
const salt = await PasswordService.generateSalt();

// Generate salt with custom rounds
const salt = await PasswordService.generateSalt(10);
```

### 4. Hash Password with Specific Salt

```javascript
const salt = await PasswordService.generateSalt();
const hashedPassword = await PasswordService.hashPasswordWithSalt('MySecurePassword123!', salt);
```

### 5. Validate Password Strength

```javascript
// Basic validation with default rules
const validation = PasswordService.validatePasswordStrength('MyPassword123');

// Custom validation rules
const validation = PasswordService.validatePasswordStrength('MyPassword123!', {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
});

if (validation.isValid) {
    console.log('Password meets strength requirements');
} else {
    console.log('Password validation errors:', validation.errors);
}
```

## API Reference

### `hashPassword(password, saltRounds)`

Hashes a password using bcrypt.

**Parameters:**
- `password` (string): Plain text password to hash
- `saltRounds` (number, optional): Number of salt rounds (default: 12)

**Returns:** Promise<string> - Hashed password

**Throws:** Error if password is invalid or hashing fails

### `comparePassword(password, hashedPassword)`

Compares a plain text password with a hashed password.

**Parameters:**
- `password` (string): Plain text password to compare
- `hashedPassword` (string): Hashed password to compare against

**Returns:** Promise<boolean> - True if passwords match, false otherwise

**Throws:** Error if parameters are invalid or comparison fails

### `generateSalt(saltRounds)`

Generates a cryptographic salt.

**Parameters:**
- `saltRounds` (number, optional): Number of salt rounds (default: 12)

**Returns:** Promise<string> - Generated salt

**Throws:** Error if salt generation fails

### `hashPasswordWithSalt(password, salt)`

Hashes a password using a specific salt.

**Parameters:**
- `password` (string): Plain text password to hash
- `salt` (string): Salt to use for hashing

**Returns:** Promise<string> - Hashed password

**Throws:** Error if parameters are invalid or hashing fails

### `validatePasswordStrength(password, options)`

Validates password strength based on configurable rules.

**Parameters:**
- `password` (string): Password to validate
- `options` (object, optional): Validation options
  - `minLength` (number, default: 8): Minimum password length
  - `requireUppercase` (boolean, default: true): Require uppercase letter
  - `requireLowercase` (boolean, default: true): Require lowercase letter
  - `requireNumbers` (boolean, default: true): Require numbers
  - `requireSpecialChars` (boolean, default: false): Require special characters

**Returns:** Object with `isValid` (boolean) and `errors` (array) properties

## Configuration

### Salt Rounds

The default salt rounds is set to 12, which provides a good balance between security and performance. You can adjust this based on your security requirements:

- **10 rounds**: Faster, less secure
- **12 rounds**: Good balance (default)
- **14+ rounds**: More secure, slower

### Password Strength Rules

Default password strength requirements:
- Minimum length: 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters: optional

## Best Practices

### 1. Always Hash Passwords

Never store plain text passwords in your database. Always use the hashing functions.

```javascript
// ❌ Don't do this
const user = {
    email: 'user@example.com',
    password: 'plaintextpassword' // Never store plain text
};

// ✅ Do this
const hashedPassword = await PasswordService.hashPassword('plaintextpassword');
const user = {
    email: 'user@example.com',
    password: hashedPassword
};
```

### 2. Validate Password Strength

Always validate password strength before hashing:

```javascript
const validation = PasswordService.validatePasswordStrength(password);
if (!validation.isValid) {
    throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
}
const hashedPassword = await PasswordService.hashPassword(password);
```

### 3. Use Secure Comparison

Always use the comparison function instead of direct string comparison:

```javascript
// ❌ Don't do this
if (user.password === inputPassword) { ... }

// ✅ Do this
const isMatch = await PasswordService.comparePassword(inputPassword, user.password);
if (isMatch) { ... }
```

### 4. Handle Errors Gracefully

Always wrap password operations in try-catch blocks:

```javascript
try {
    const hashedPassword = await PasswordService.hashPassword(password);
    // Save to database
} catch (error) {
    console.error('Password hashing failed:', error.message);
    // Handle error appropriately
}
```

## Integration Examples

### User Registration

```javascript
import PasswordService from './services/passwordService.js';

async function registerUser(userData) {
    try {
        // Validate password strength
        const validation = PasswordService.validatePasswordStrength(userData.password);
        if (!validation.isValid) {
            throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
        }

        // Hash password
        const hashedPassword = await PasswordService.hashPassword(userData.password);

        // Save user to database
        const user = await User.create({
            ...userData,
            password: hashedPassword
        });

        return user;
    } catch (error) {
        throw error;
    }
}
```

### User Login

```javascript
import PasswordService from './services/passwordService.js';

async function loginUser(email, password) {
    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('User not found');
        }

        // Compare password
        const isMatch = await PasswordService.comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { user, token };
    } catch (error) {
        throw error;
    }
}
```

### Password Update

```javascript
import PasswordService from './services/passwordService.js';

async function updatePassword(userId, currentPassword, newPassword) {
    try {
        // Get user
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await PasswordService.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password strength
        const validation = PasswordService.validatePasswordStrength(newPassword);
        if (!validation.isValid) {
            throw new Error(`New password validation failed: ${validation.errors.join(', ')}`);
        }

        // Hash new password
        const hashedNewPassword = await PasswordService.hashPassword(newPassword);

        // Update user password
        await user.update({ password: hashedNewPassword });

        return { success: true };
    } catch (error) {
        throw error;
    }
}
```

## Security Considerations

1. **Salt Rounds**: Use at least 10 rounds for production applications
2. **Password Storage**: Never store plain text passwords
3. **Input Validation**: Always validate input before processing
4. **Error Messages**: Don't reveal sensitive information in error messages
5. **Rate Limiting**: Implement rate limiting for login attempts
6. **HTTPS**: Always use HTTPS in production

## Testing

You can test the password service using the provided example file:

```javascript
import { hashPasswordExample, comparePasswordExample } from './services/passwordServiceExample.js';

// Run examples
await hashPasswordExample();
await comparePasswordExample('testpassword', hashedPassword);
```

## Troubleshooting

### Common Issues

1. **"Password must be a non-empty string"**: Ensure the password parameter is a valid string
2. **"Failed to hash password"**: Check if bcryptjs is properly installed
3. **"Failed to compare passwords"**: Ensure both password and hashedPassword are valid strings

### Performance

- Password hashing is intentionally slow for security reasons
- Consider using async/await to avoid blocking the event loop
- For high-traffic applications, consider implementing caching strategies

## Migration from Plain Text Passwords

If you have existing users with plain text passwords, you'll need to implement a migration strategy:

1. Add a `password_version` field to your user table
2. When users log in with plain text passwords, hash them and update the version
3. Gradually migrate all users to hashed passwords

```javascript
// Migration example
async function migrateUserPassword(user, plainTextPassword) {
    const hashedPassword = await PasswordService.hashPassword(plainTextPassword);
    await user.update({ 
        password: hashedPassword, 
        password_version: 'hashed' 
    });
}
``` 