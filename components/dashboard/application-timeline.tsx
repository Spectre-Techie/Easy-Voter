"use client"

import { VoterApplication } from "@prisma/client"
import { CheckCircle2, Clock, XCircle, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineEvent {
    status: "completed" | "current" | "pending"
    title: string
    description?: string
    date?: Date
    icon: React.ElementType
}

interface ApplicationTimelineProps {
    application: VoterApplication | null
}

export function ApplicationTimeline({ application }: ApplicationTimelineProps) {
    // Handle null application (new users)
    if (!application) {
        return null
    }

    const getTimelineEvents = (): TimelineEvent[] => {
        const events: TimelineEvent[] = [
            {
                status: "completed",
                title: "Application Submitted",
                description: "Your application has been received",
                date: application.submittedAt || application.createdAt,
                icon: FileCheck,
            },
        ]

        if (application.status === "PENDING") {
            events.push({
                status: "current",
                title: "Under Review",
                description: "Our team is reviewing your application",
                date: application.submittedAt || undefined,
                icon: Clock,
            })
            events.push({
                status: "pending",
                title: "Decision Pending",
                description: "You'll be notified once reviewed",
                icon: CheckCircle2,
            })
        } else if (application.status === "APPROVED") {
            events.push({
                status: "completed",
                title: "Under Review",
                description: "Application reviewed by admin",
                date: application.reviewedAt || undefined,
                icon: Clock,
            })
            events.push({
                status: "completed",
                title: "Application Approved",
                description: "Your voter registration is approved!",
                date: application.reviewedAt || undefined,
                icon: CheckCircle2,
            })
        } else if (application.status === "REJECTED") {
            events.push({
                status: "completed",
                title: "Under Review",
                description: "Application reviewed by admin",
                date: application.reviewedAt || undefined,
                icon: Clock,
            })
            events.push({
                status: "completed",
                title: "Application Rejected",
                description: application.reviewNotes || "Please review the feedback",
                date: application.reviewedAt || undefined,
                icon: XCircle,
            })
        }

        return events
    }

    const events = getTimelineEvents()

    return (
        <div className="space-y-4">
            {events.map((event, index) => {
                const Icon = event.icon
                const isLast = index === events.length - 1

                return (
                    <div key={index} className="relative flex gap-4">
                        {/* Timeline line */}
                        {!isLast && (
                            <div
                                className={cn(
                                    "absolute left-5 top-10 w-0.5 h-full -ml-px",
                                    event.status === "completed"
                                        ? "bg-green-500"
                                        : event.status === "current"
                                            ? "bg-gradient-to-b from-green-500 to-gray-300"
                                            : "bg-gray-300"
                                )}
                            />
                        )}

                        {/* Icon */}
                        <div
                            className={cn(
                                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                                event.status === "completed"
                                    ? "border-green-500 bg-green-50 text-green-600"
                                    : event.status === "current"
                                        ? "border-blue-500 bg-blue-50 text-blue-600 ring-4 ring-blue-100"
                                        : "border-gray-300 bg-gray-50 text-gray-400"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <div className="flex items-center gap-2">
                                <h4
                                    className={cn(
                                        "font-semibold",
                                        event.status === "completed"
                                            ? "text-gray-900"
                                            : event.status === "current"
                                                ? "text-blue-600"
                                                : "text-gray-500"
                                    )}
                                >
                                    {event.title}
                                </h4>
                                {event.status === "current" && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                        In Progress
                                    </span>
                                )}
                            </div>
                            {event.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {event.description}
                                </p>
                            )}
                            {event.date && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {new Date(event.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
