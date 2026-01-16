import { z } from "zod"

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
})

export const updatePasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

// ============================================
// VOTER APPLICATION SCHEMAS
// ============================================

// Step 1: Personal Information
export const personalInfoSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    middleName: z.string().optional(),
    dateOfBirth: z.date({
        required_error: "Date of birth is required",
    }),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
        required_error: "Please select a gender",
    }),
}).refine((data) => {
    // Must be 18 or older
    const today = new Date()
    const birthDate = new Date(data.dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18
    }

    return age >= 18
}, {
    message: "You must be at least 18 years old to register",
    path: ["dateOfBirth"],
})

// Step 2: Contact Details
export const contactDetailsSchema = z.object({
    email: z.string().email("Invalid email address"),
    phoneNumber: z
        .string()
        .regex(/^(\+1|1)?[\s.-]?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
            "Please enter a valid phone number (e.g., (555) 123-4567)"
        ),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().length(2, "Please select a state"),
    zipCode: z
        .string()
        .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)"),
})

// Step 3: Document Upload (handled separately with file upload)
export const documentUploadSchema = z.object({
    idPhotoUrl: z.string().url("Invalid photo URL"),
    idPhotoKey: z.string().min(1, "Photo key is required"),
})

// Complete voter application (all steps combined)
export const voterApplicationSchema = personalInfoSchema
    .merge(contactDetailsSchema)
    .merge(documentUploadSchema)

// ============================================
// ADMIN SCHEMAS
// ============================================

export const reviewApplicationSchema = z.object({
    applicationId: z.string().cuid(),
    action: z.enum(["APPROVE", "REJECT"]),
    reviewNotes: z.string().min(10, "Review notes must be at least 10 characters").optional(),
}).refine((data) => {
    // If rejecting, notes are required
    if (data.action === "REJECT" && !data.reviewNotes) {
        return false
    }
    return true
}, {
    message: "Review notes are required when rejecting an application",
    path: ["reviewNotes"],
})

// ============================================
// SEARCH & FILTER SCHEMAS
// ============================================

export const applicationFilterSchema = z.object({
    status: z.enum(["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED"]).optional(),
    search: z.string().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
})

// ============================================
// TYPE EXPORTS (inferred from schemas)
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
export type ContactDetailsInput = z.infer<typeof contactDetailsSchema>
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
export type VoterApplicationInput = z.infer<typeof voterApplicationSchema>
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>
export type ApplicationFilterInput = z.infer<typeof applicationFilterSchema>
