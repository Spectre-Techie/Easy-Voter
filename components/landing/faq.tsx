"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
    {
        question: "How long does the registration process take?",
        answer: "The entire registration process typically takes less than 10 minutes to complete. Once submitted, applications are usually reviewed and approved within 24 hours.",
    },
    {
        question: "What documents do I need?",
        answer: "You'll need a valid email address, a recent passport photograph, and basic personal information including your date of birth, state, LGA, and ward.",
    },
    {
        question: "Is my data secure?",
        answer: "Yes! We use industry-standard encryption to protect your personal information. Your data is stored securely and only used for voter registration purposes.",
    },
    {
        question: "Can I track my application status?",
        answer: "Absolutely! Once you've submitted your application, you can log in anytime to check the status. You'll also receive email notifications at each stage of the process.",
    },
    {
        question: "What if my application is rejected?",
        answer: "If your application is rejected, you'll receive detailed feedback explaining why. You can then make the necessary corrections and resubmit your application immediately.",
    },
    {
        question: "How do I download my voter card?",
        answer: "Once your application is approved, you can download your digital voter card directly from your dashboard. It will be a PDF file that you can print or save on your device.",
    },
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="py-16 lg:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Got questions? We've got answers.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border-2 rounded-lg overflow-hidden hover:border-blue-200 transition-colors"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-semibold text-lg pr-8">{faq.question}</span>
                                    <ChevronDown
                                        className={cn(
                                            "w-5 h-5 text-slate-600 transition-transform flex-shrink-0",
                                            openIndex === index && "rotate-180"
                                        )}
                                    />
                                </button>

                                <div
                                    className={cn(
                                        "grid transition-all duration-300 ease-in-out",
                                        openIndex === index
                                            ? "grid-rows-[1fr] opacity-100"
                                            : "grid-rows-[0fr] opacity-0"
                                    )}
                                >
                                    <div className="overflow-hidden">
                                        <p className="p-5 pt-0 text-slate-700 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
