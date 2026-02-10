"use client";

import { Navbar } from "../components/Navbar";
import { Button, Card } from "@salesos/ui";
import { Check, ChevronRight, Zap, Target, BarChart, Users } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-24 px-4 text-center max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
            The Ultimate <span className="text-blue-600">Sales Operating System</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            Orchestrate your entire sales cycle from lead generation to closing.
            AI-powered intelligence for modern revenue teams.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="primary" className="h-12 px-8 text-lg w-full sm:w-auto">
                Start Free Trial <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto">
                Watch Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why SalesOS?</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Everything you need to scale your revenue engine.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Target className="w-8 h-8 text-blue-500" />}
                title="Precision Prospecting"
                description="Identify high-intent leads with AI-driven market intelligence and enrichment."
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-yellow-500" />}
                title="Automated Outreach"
                description="Execute multi-channel sequences across Email, LinkedIn, and Phone effortlessly."
              />
              <FeatureCard
                icon={<BarChart className="w-8 h-8 text-green-500" />}
                title="Revenue Intelligence"
                description="Forecast with confidence using predictive analytics and deal scoring."
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-8">Trusted by forward-thinking teams</p>
            <div className="flex justify-center gap-8 opacity-50 grayscale">
               {/* Placeholders for logos */}
               <div className="h-8 w-24 bg-slate-300 rounded"></div>
               <div className="h-8 w-24 bg-slate-300 rounded"></div>
               <div className="h-8 w-24 bg-slate-300 rounded"></div>
               <div className="h-8 w-24 bg-slate-300 rounded"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-blue-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your sales process?</h2>
            <p className="text-blue-100 mb-8 text-lg">Join thousands of sales professionals crushing their quotas with SalesOS.</p>
            <Link href="/dashboard">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 text-lg font-semibold">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <span className="text-white font-bold text-xl">SalesOS</span>
            <p className="mt-4 text-sm">The all-in-one platform for modern sales teams.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#">Features</Link></li>
              <li><Link href="#">Pricing</Link></li>
              <li><Link href="#">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#">About</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#">Privacy</Link></li>
              <li><Link href="#">Terms</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </Card>
  );
}
