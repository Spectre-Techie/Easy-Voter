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

// Server-side schema for API (confirmPassword is validated on client)
export const registerApiSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
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

// Step 1: Personal Information (Nigerian format)
export const personalInfoSchema = z.object({
    surname: z.string().min(2, "Surname must be at least 2 characters"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    middleName: z.string().optional(),
    dateOfBirth: z.coerce.date({ message: "Date of birth is required" }),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
        message: "Please select a gender",
    }),
    phoneNumber: z.string().regex(/^\+234[0-9]{10}$/, "Phone number must be in format +234XXXXXXXXXX"),
    email: z.string().email("Invalid email address"),
    occupation: z.string().min(2, "Occupation is required"),
    nin: z.string().regex(/^[0-9]{11}$/, "NIN must be 11 digits").optional(),
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

// Step 2: Address Information (Nigerian-specific)
export const addressInfoSchema = z.object({
    state: z.string().min(1, "Please select your state"),
    lga: z.string().min(1, "Please select your LGA"),
    ward: z.string().min(1, "Please select your ward"),
    pollingUnit: z.string().optional(),
    streetAddress: z.string().min(5, "Street address must be at least 5 characters"),
    landmark: z.string().optional(),
})

// Step 3: Document Upload
export const documentUploadSchema = z.object({
    idPhotoUrl: z.string().url("Invalid ID photo URL"),
    idPhotoKey: z.string().min(1, "ID photo key is required"),
    passportPhotoUrl: z.string().url("Invalid passport photo URL"),
    passportPhotoKey: z.string().min(1, "Passport photo key is required"),
    proofOfAddressUrl: z.string().url().optional(),
    proofOfAddressKey: z.string().optional(),
})

// Step 4: Additional Information
export const additionalInfoSchema = z.object({
    disability: z.enum(["None", "Visual", "Hearing", "Mobility", "Other"]).default("None"),
    preferredLanguage: z.enum(["English", "Hausa", "Yoruba", "Igbo", "Pidgin"]).default("English"),
    previousVoterCard: z.string().optional(),
})

// Complete voter application (all steps combined)
export const voterApplicationSchema = personalInfoSchema
    .merge(addressInfoSchema)
    .merge(documentUploadSchema)
    .merge(additionalInfoSchema)

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
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
export type AddressInfoInput = z.infer<typeof addressInfoSchema>
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
export type AdditionalInfoInput = z.infer<typeof additionalInfoSchema>
export type VoterApplicationInput = z.infer<typeof voterApplicationSchema>
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>
export type ApplicationFilterInput = z.infer<typeof applicationFilterSchema>
