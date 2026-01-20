"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, MapPin, Upload, Info, CheckCircle,
    ArrowRight, ArrowLeft, Loader2
} from "lucide-react"
import {
    personalInfoSchema,
    addressInfoSchema,
    documentUploadSchema,
    additionalInfoSchema,
    type PersonalInfoInput,
    type AddressInfoInput,
    type DocumentUploadInput,
    type AdditionalInfoInput
} from "@/lib/validations"
import { NIGERIAN_STATES, getAllLGANames } from "@/lib/nigerian-states"
import { FileUpload } from "@/components/file-upload"

const STEPS = [
    { id: 1, name: "Personal Info", icon: User },
    { id: 2, name: "Address", icon: MapPin },
    { id: 3, name: "Documents", icon: Upload },
    { id: 4, name: "Additional", icon: Info },
    { id: 5, name: "Review", icon: CheckCircle },
]

type FormData = PersonalInfoInput & AddressInfoInput & DocumentUploadInput & AdditionalInfoInput

export default function ApplyPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<Partial<FormData>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Get current step schema
    const getCurrentSchema = () => {
        switch (currentStep) {
            case 1: return personalInfoSchema
            case 2: return addressInfoSchema
            case 3: return documentUploadSchema
            case 4: return additionalInfoSchema
            default: return personalInfoSchema
        }
    }

    const form = useForm({
        resolver: zodResolver(getCurrentSchema()),
        defaultValues: formData,
    })

    const onNext = async (data: any) => {
        setFormData({ ...formData, ...data })

        // Auto-save to localStorage
        localStorage.setItem("voterApplicationDraft", JSON.stringify({ ...formData, ...data }))

        if (currentStep < 5) {
            setCurrentStep(currentStep + 1)
            form.reset(data)
        }
    }

    const onBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const onSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch("/api/applications/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error("Submission failed")

            // Clear draft
            localStorage.removeItem("voterApplicationDraft")

            router.push("/dashboard?application=success")
        } catch (error) {
            console.error("Submission error:", error)
            alert("Failed to submit application. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const progress = (currentStep / STEPS.length) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Voter Registration
                    </h1>
                    <p className="text-gray-600">
                        Complete your registration in 5 simple steps
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-4">
                        {STEPS.map((step) => {
                            const Icon = step.icon
                            const isActive = currentStep === step.id
                            const isCompleted = currentStep > step.id

                            return (
                                <div key={step.id} className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isCompleted
                                            ? "bg-green-600 text-white"
                                            : isActive
                                                ? "bg-green-600 text-white ring-4 ring-green-200"
                                                : "bg-gray-200 text-gray-400"
                                            }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span
                                        className={`text-xs font-medium ${isActive ? "text-green-600" : "text-gray-500"
                                            }`}
                                    >
                                        {step.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="bg-green-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                        {Math.round(progress)}% Complete
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <form onSubmit={form.handleSubmit(onNext)}>
                                {currentStep === 1 && <Step1PersonalInfo form={form} />}
                                {currentStep === 2 && <Step2AddressInfo form={form} formData={formData} />}
                                {currentStep === 3 && <Step3Documents form={form} />}
                                {currentStep === 4 && <Step4Additional form={form} />}
                                {currentStep === 5 && <Step5Review formData={formData} />}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8">
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        disabled={currentStep === 1}
                                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back
                                    </button>

                                    {currentStep < 5 ? (
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                                        >
                                            Next
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={onSubmit}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    Submit Application
                                                    <CheckCircle className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Auto-save Indicator */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    💾 Your progress is automatically saved
                </p>
            </div>
        </div>
    )
}

// Step 1: Personal Information
function Step1PersonalInfo({ form }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...form.register("surname")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your surname"
                    />
                    {form.formState.errors.surname && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.surname.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...form.register("firstName")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your first name"
                    />
                    {form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Middle Name
                    </label>
                    <input
                        {...form.register("middleName")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your middle name (optional)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        {...form.register("dateOfBirth", { valueAsDate: true })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {form.formState.errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...form.register("gender")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                    {form.formState.errors.gender && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.gender.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...form.register("phoneNumber")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+234XXXXXXXXXX"
                    />
                    {form.formState.errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.phoneNumber.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        {...form.register("email")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                    />
                    {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occupation <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...form.register("occupation")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Teacher, Engineer"
                    />
                    {form.formState.errors.occupation && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.occupation.message}</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        National Identity Number (NIN)
                    </label>
                    <input
                        {...form.register("nin")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="11-digit NIN (optional but recommended)"
                        maxLength={11}
                    />
                    {form.formState.errors.nin && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.nin.message}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

// Step 2: Address Information
function Step2AddressInfo({ form, formData }: any) {
    const [selectedState, setSelectedState] = useState(formData?.state || "")
    const [lgas, setLgas] = useState<string[]>([])

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value
        setSelectedState(state)
        setLgas(getAllLGANames(state))
        form.setValue("lga", "")
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Address Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...form.register("state")}
                        onChange={handleStateChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">Select your state</option>
                        {NIGERIAN_STATES.map((state) => (
                            <option key={state.name} value={state.name}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                    {form.formState.errors.state && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.state.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Local Government Area (LGA) <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...form.register("lga")}
                        disabled={!selectedState}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    >
                        <option value="">Select your LGA</option>
                        {lgas.map((lga) => (
                            <option key={lga} value={lga}>
                                {lga}
                            </option>
                        ))}
                    </select>
                    {form.formState.errors.lga && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.lga.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ward <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...form.register("ward")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your ward"
                    />
                    {form.formState.errors.ward && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.ward.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Polling Unit
                    </label>
                    <input
                        {...form.register("pollingUnit")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter polling unit (optional)"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        {...form.register("streetAddress")}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your full street address"
                    />
                    {form.formState.errors.streetAddress && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.streetAddress.message}</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark
                    </label>
                    <input
                        {...form.register("landmark")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Nearest landmark (optional)"
                    />
                </div>
            </div>
        </div>
    )
}

// Step 3: Documents
function Step3Documents({ form }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Upload</h2>

            <div className="space-y-6">
                <FileUpload
                    label="Valid ID (NIN Slip, Driver's License, or Passport)"
                    required
                    accept="image/*,application/pdf"
                    onUpload={(url, key) => {
                        form.setValue("idPhotoUrl", url)
                        form.setValue("idPhotoKey", key)
                    }}
                    currentUrl={form.getValues("idPhotoUrl")}
                />

                <FileUpload
                    label="Passport Photograph"
                    required
                    accept="image/*"
                    onUpload={(url, key) => {
                        form.setValue("passportPhotoUrl", url)
                        form.setValue("passportPhotoKey", key)
                    }}
                    currentUrl={form.getValues("passportPhotoUrl")}
                />

                <FileUpload
                    label="Proof of Address (Optional)"
                    accept="image/*,application/pdf"
                    onUpload={(url, key) => {
                        form.setValue("proofOfAddressUrl", url)
                        form.setValue("proofOfAddressKey", key)
                    }}
                    currentUrl={form.getValues("proofOfAddressUrl")}
                />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                    📸 <strong>Tips:</strong> Ensure all documents are clear and readable. Maximum file size is 5MB per document.
                </p>
            </div>
        </div>
    )
}

// Step 4: Additional Information
function Step4Additional({ form }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disability Status
                    </label>
                    <select
                        {...form.register("disability")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="None">None</option>
                        <option value="Visual">Visual</option>
                        <option value="Hearing">Hearing</option>
                        <option value="Mobility">Mobility</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Language
                    </label>
                    <select
                        {...form.register("preferredLanguage")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="English">English</option>
                        <option value="Hausa">Hausa</option>
                        <option value="Yoruba">Yoruba</option>
                        <option value="Igbo">Igbo</option>
                        <option value="Pidgin">Pidgin</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Voter Card Number
                    </label>
                    <input
                        {...form.register("previousVoterCard")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="If transferring, enter previous voter card number"
                    />
                </div>
            </div>
        </div>
    )
}

// Step 5: Review
function Step5Review({ formData }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Application</h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                    <p className="text-gray-700">
                        {formData.surname} {formData.firstName} {formData.middleName}
                    </p>
                    <p className="text-gray-600 text-sm">{formData.email} • {formData.phoneNumber}</p>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                    <p className="text-gray-700">{formData.streetAddress}</p>
                    <p className="text-gray-600 text-sm">
                        {formData.ward}, {formData.lga}, {formData.state}
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        ✓ Please review all information carefully before submitting
                    </p>
                </div>
            </div>
        </div>
    )
}
