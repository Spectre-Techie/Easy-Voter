import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
    return (
        <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl md:text-5xl font-bold">
                        Ready to Make Your Voice Heard?
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-100">
                        Join thousands of Nigerians who have already registered.
                        Your vote is your power.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto group"
                            >
                                Start Registration Now
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/verify">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600 text-lg px-8 py-6 h-auto transition-all"
                            >
                                Verify a Voter Card
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-8 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="space-y-2">
                            <div className="text-4xl font-bold">10K+</div>
                            <div className="text-sm text-blue-100">Registered Voters</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold">98%</div>
                            <div className="text-sm text-blue-100">Approval Rate</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold">24h</div>
                            <div className="text-sm text-blue-100">Avg. Processing</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
