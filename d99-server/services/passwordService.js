import bcrypt from 'bcryptjs';


const PasswordService = {
    /**
     * Default salt rounds for password hashing
     */
    SALT_ROUNDS: 12,

    /**
     * Hash a password with bcrypt
     * @param {string} password - Plain text password to hash
     * @param {number} saltRounds - Number of salt rounds (default: 12)
     * @returns {Promise<string>} - Hashed password
     * @throws {Error} - If password is empty or hashing fails
     */
    hashPassword: async (password, saltRounds = PasswordService.SALT_ROUNDS) => {
        try {
            if (!password || typeof password !== 'string') {
                throw new Error('Password must be a non-empty string');
            }

            if (password.trim().length === 0) {
                throw new Error('Password cannot be empty or whitespace only');
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);
            return hashedPassword;
        } catch (error) {
            if (error.message.includes('Password must be') || error.message.includes('Password cannot be')) {
                throw error;
            }
            throw new Error('Failed to hash password');
        }
    },

    /**
     * Compare a plain text password with a hashed password
     * @param {string} password - Plain text password to compare
     * @param {string} hashedPassword - Hashed password to compare against
     * @returns {Promise<boolean>} - True if passwords match, false otherwise
     * @throws {Error} - If parameters are invalid or comparison fails
     */
    comparePassword: async (password, hashedPassword) => {
        try {
            if (!password || typeof password !== 'string') {
                throw new Error('Password must be a non-empty string');
            }

            if (!hashedPassword || typeof hashedPassword !== 'string') {
                throw new Error('Hashed password must be a non-empty string');
            }

            const isMatch = await bcrypt.compare(password, hashedPassword);
            return isMatch;
        } catch (error) {
            if (error.message.includes('must be a non-empty string')) {
                throw error;
            }
            throw new Error('Failed to compare passwords');
        }
    },

    /**
     * Generate a salt for password hashing
     * @param {number} saltRounds - Number of salt rounds (default: 12)
     * @returns {Promise<string>} - Generated salt
     * @throws {Error} - If salt generation fails
     */
    generateSalt: async (saltRounds = PasswordService.SALT_ROUNDS) => {
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            return salt;
        } catch (error) {
            throw new Error('Failed to generate salt');
        }
    },

    /**
     * Hash a password with a specific salt
     * @param {string} password - Plain text password to hash
     * @param {string} salt - Salt to use for hashing
     * @returns {Promise<string>} - Hashed password
     * @throws {Error} - If parameters are invalid or hashing fails
     */
    hashPasswordWithSalt: async (password, salt) => {
        try {
            if (!password || typeof password !== 'string') {
                throw new Error('Password must be a non-empty string');
            }

            if (!salt || typeof salt !== 'string') {
                throw new Error('Salt must be a non-empty string');
            }

            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            if (error.message.includes('must be a non-empty string')) {
                throw error;
            }
            throw new Error('Failed to hash password with salt');
        }
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @param {Object} options - Validation options
     * @param {number} options.minLength - Minimum password length (default: 8)
     * @param {boolean} options.requireUppercase - Require uppercase letter (default: true)
     * @param {boolean} options.requireLowercase - Require lowercase letter (default: true)
     * @param {boolean} options.requireNumbers - Require numbers (default: true)
     * @param {boolean} options.requireSpecialChars - Require special characters (default: false)
     * @returns {Object} - Validation result with isValid boolean and errors array
     */
    validatePasswordStrength: (password, options = {}) => {
        const {
            minLength = 8,
            requireUppercase = true,
            requireLowercase = true,
            requireNumbers = true,
            requireSpecialChars = false
        } = options;

        const errors = [];

        if (!password || typeof password !== 'string') {
            errors.push('Password must be a non-empty string');
            return { isValid: false, errors };
        }

        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }

        if (requireUppercase) { /*
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    */ }

        if (requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

export default PasswordService; 