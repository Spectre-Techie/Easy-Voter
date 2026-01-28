"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <footer className="border-t bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">EV</span>
                            </div>
                            <span className="font-bold text-xl text-white">EasyVoter</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Empowering Nigerian citizens with secure, fast, and accessible voter registration.
                            Your voice matters. Register to vote today.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3 pt-2">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-sky-500 flex items-center justify-center transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    Contact Support
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-white text-lg mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/register" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    How to Register
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    Track Application
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    Download Voter Card
                                </Link>
                            </li>
                            <li>
                                <Link href="/verify" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    Verify Voter Card
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                                    Help Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-white text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-white">Email</p>
                                    <a href="mailto:support@easyvoter.ng" className="text-sm hover:text-blue-400 transition-colors">
                                        support@easyvoter.ng
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-white">Phone</p>
                                    <a href="tel:+2348012345678" className="text-sm hover:text-blue-400 transition-colors">
                                        +234 801 234 5678
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-white">Office</p>
                                    <p className="text-sm text-slate-400">
                                        INEC Headquarters<br />
                                        Abuja, Nigeria
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-700">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-slate-400 text-center md:text-left">
                            © {new Date().getFullYear()} EasyVoter. All rights reserved.
                            <span className="hidden md:inline"> | </span>
                            <span className="block md:inline mt-1 md:mt-0">
                                Secure • Accessible • Democratic
                            </span>
                        </div>

                        {/* Back to Top Button */}
                        <Button
                            onClick={scrollToTop}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 hover:bg-slate-800 hover:border-blue-500 transition-all group"
                        >
                            <ArrowUp className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                            Back to Top
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    )
}
