"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Shield, Zap, Users, Clock, Award } from "lucide-react"
import { Footer } from "@/components/landing/footer"
import { Testimonials } from "@/components/landing/testimonials"
import { FAQ } from "@/components/landing/faq"
import { CTASection } from "@/components/landing/cta-section"
import { LandingMobileNav } from "@/components/landing/mobile-nav"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EV</span>
            </div>
            <span className="font-bold text-xl">EasyVoter</span>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
          {/* Mobile Navigation */}
          <LandingMobileNav />
        </div>
      </header>

      {/* Hero Section - Enhanced */}
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6 lg:space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border-2 border-blue-100 text-sm font-medium text-blue-700">
            <Award className="w-4 h-4" />
            Trusted by 10,000+ Nigerian Citizens
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight px-4">
            Register to Vote in Minutes
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Secure, fast, and accessible voter registration system. Join thousands of citizens exercising their democratic rights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 px-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="text-lg px-8 w-full sm:w-auto h-12">
                Start Registration
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto h-12">
                Check Application Status
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 max-w-2xl mx-auto px-4">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">10K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Registered</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">98%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">&lt;24h</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Expanded to 6 */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose EasyVoter?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            The most trusted and efficient voter registration platform in Nigeria
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-blue-200 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Complete your registration in under 5 minutes from any device
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-200 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Bank-Level Security</CardTitle>
              <CardDescription>
                Your data is protected with industry-standard encryption
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-200 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Real-time Tracking</CardTitle>
              <CardDescription>
                Monitor your application status with live updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-orange-200 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>24/7 Support</CardTitle>
              <CardDescription>
                Get help whenever you need it from our dedicated team
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-200 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-pink-600" />
              </div>
              <CardTitle>Quick Approval</CardTitle>
              <CardDescription>
                Most applications approved within 24 hours
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-indigo-200 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Digital Voter Card</CardTitle>
              <CardDescription>
                Download your official voter card instantly as PDF
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold">Create Account</h3>
              <p className="text-muted-foreground px-4">
                Sign up with your email and create a secure password in seconds
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold">Fill Application</h3>
              <p className="text-muted-foreground px-4">
                Complete the simple 4-step form with your details and upload a photo
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Approved</h3>
              <p className="text-muted-foreground px-4">
                Download your digital voter card within 24 hours of approval
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
