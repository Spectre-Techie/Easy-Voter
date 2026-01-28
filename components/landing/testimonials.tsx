"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
    {
        name: "Aisha Mohammed",
        location: "Lagos State",
        initials: "AM",
        rating: 5,
        text: "The registration process was incredibly smooth! I got my voter card approved within 24 hours. EasyVoter made it so simple.",
    },
    {
        name: "Chukwudi Okafor",
        location: "Enugu State",
        initials: "CO",
        rating: 5,
        text: "Finally, a platform that actually works! No long queues, no stress. I registered from my phone in less than 10 minutes.",
    },
    {
        name: "Fatima Bello",
        location: "Kano State",
        initials: "FB",
        rating: 5,
        text: "I was hesitant at first, but the process was very secure and transparent. I could track my application every step of the way.",
    },
]

export function Testimonials() {
    return (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        What Citizens Are Saying
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of Nigerians who have successfully registered to vote using EasyVoter
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border-2 hover:border-blue-200 hover:shadow-lg transition-all">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600">
                                        <AvatarFallback className="text-white font-semibold">
                                            {testimonial.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{testimonial.name}</h3>
                                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                                    </div>
                                </div>

                                <div className="flex gap-1 mb-3">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                <p className="text-sm text-slate-700 leading-relaxed">
                                    "{testimonial.text}"
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
