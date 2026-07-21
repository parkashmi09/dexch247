// import PasswordService from './passwordService.js';

// /**
//  * Example usage of PasswordService
//  * This file demonstrates how to use the password service for various operations
//  */

// // Example 1: Hash a password
// async function hashPasswordExample() {
//     try {
//         const plainPassword = 'MySecurePassword123!';
//         const hashedPassword = await PasswordService.hashPassword(plainPassword);
//         console.log('Hashed password:', hashedPassword);
//         return hashedPassword;
//     } catch (error) {
//         console.error('Error hashing password:', error.message);
//     }
// }

// // Example 2: Compare passwords
// async function comparePasswordExample(plainPassword, hashedPassword) {
//     try {
//         const isMatch = await PasswordService.comparePassword(plainPassword, hashedPassword);
//         console.log('Password match:', isMatch);
//         return isMatch;
//     } catch (error) {
//         console.error('Error comparing passwords:', error.message);
//     }
// }

// // Example 3: Generate salt
// async function generateSaltExample() {
//     try {
//         const salt = await PasswordService.generateSalt(10);
//         console.log('Generated salt:', salt);
//         return salt;
//     } catch (error) {
//         console.error('Error generating salt:', error.message);
//     }
// }

// // Example 4: Hash password with specific salt
// async function hashWithSaltExample() {
//     try {
//         const plainPassword = 'MySecurePassword123!';
//         const salt = await PasswordService.generateSalt();
//         const hashedPassword = await PasswordService.hashPasswordWithSalt(plainPassword, salt);
//         console.log('Hashed password with salt:', hashedPassword);
//         return hashedPassword;
//     } catch (error) {
//         console.error('Error hashing with salt:', error.message);
//     }
// }

// // Example 5: Validate password strength
// function validatePasswordStrengthExample() {
//     const passwords = [
//         'weak',
//         'Strong123',
//         'VeryStrongPassword123!',
//         '12345678',
//         'PasswordWithoutNumbers',
//         'passwordwithoutuppercase123'
//     ];

//     passwords.forEach(password => {
//         const validation = PasswordService.validatePasswordStrength(password, {
//             minLength: 8,
//             requireUppercase: true,
//             requireLowercase: true,
//             requireNumbers: true,
//             requireSpecialChars: false
//         });

//         console.log(`Password: "${password}"`);
//         console.log(`Valid: ${validation.isValid}`);
//         if (!validation.isValid) {
//             console.log(`Errors: ${validation.errors.join(', ')}`);
//         }
//         console.log('---');
//     });
// }

// // Example 6: Complete user registration flow
// async function userRegistrationExample() {
//     try {
//         const userData = {
//             email: 'user@example.com',
//             password: 'SecurePassword123!',
//             username: 'testuser'
//         };

//         // Validate password strength
//         const passwordValidation = PasswordService.validatePasswordStrength(userData.password);
//         if (!passwordValidation.isValid) {
//             throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
//         }

//         // Hash the password
//         const hashedPassword = await PasswordService.hashPassword(userData.password);
        
//         // Simulate saving to database
//         const userRecord = {
//             ...userData,
//             password: hashedPassword,
//             created_at: new Date()
//         };

//         console.log('User registered successfully:', {
//             email: userRecord.email,
//             username: userRecord.username,
//             password: '[HIDDEN]',
//             created_at: userRecord.created_at
//         });

//         return userRecord;
//     } catch (error) {
//         console.error('Registration failed:', error.message);
//     }
// }

// // Example 7: Complete user login flow
// async function userLoginExample(email, password) {
//     try {
//         // Simulate fetching user from database
//         const userRecord = {
//             email: 'user@example.com',
//             password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O', // Example hashed password
//             user_id: '12345',
//             role: 'user'
//         };

//         // Compare password
//         const isMatch = await PasswordService.comparePassword(password, userRecord.password);
        
//         if (isMatch) {
//             console.log('Login successful for user:', userRecord.email);
//             return { success: true, user: userRecord };
//         } else {
//             console.log('Login failed: Invalid credentials');
//             return { success: false, message: 'Invalid credentials' };
//         }
//     } catch (error) {
//         console.error('Login error:', error.message);
//         return { success: false, message: 'Login error' };
//     }
// }

// // Export examples for use in other files
// export {
//     hashPasswordExample,
//     comparePasswordExample,
//     generateSaltExample,
//     hashWithSaltExample,
//     validatePasswordStrengthExample,
//     userRegistrationExample,
//     userLoginExample
// };

// // Uncomment to run examples
// /*
// (async () => {
//     console.log('=== Password Service Examples ===\n');
    
//     console.log('1. Hashing password:');
//     const hashedPassword = await hashPasswordExample();
    
//     console.log('\n2. Comparing passwords:');
//     await comparePasswordExample('MySecurePassword123!', hashedPassword);
//     await comparePasswordExample('WrongPassword', hashedPassword);
    
//     console.log('\n3. Generating salt:');
//     await generateSaltExample();
    
//     console.log('\n4. Hashing with salt:');
//     await hashWithSaltExample();
    
//     console.log('\n5. Password strength validation:');
//     validatePasswordStrengthExample();
    
//     console.log('\n6. User registration flow:');
//     await userRegistrationExample();
    
//     console.log('\n7. User login flow:');
//     await userLoginExample('user@example.com', 'SecurePassword123!');
//     await userLoginExample('user@example.com', 'WrongPassword');
// })();
// */ 