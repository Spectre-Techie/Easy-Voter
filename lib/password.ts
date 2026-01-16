import bcrypt from "bcryptjs"

/**
 * Hash a password using bcrypt with cost factor 12
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12)
    return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

/**
 * Check if a password meets strength requirements
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean
    message?: string
} {
    if (password.length < 8) {
        return { isValid: false, message: "Password must be at least 8 characters" }
    }

    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one uppercase letter" }
    }

    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one number" }
    }

    return { isValid: true }
}
