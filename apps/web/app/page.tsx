'use client';

import { Button, Card } from '@salesos/ui';
import {
  BarChart,
  Check,
  ChevronRight,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { Navbar } from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-slate-950">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-24 text-center md:pb-24 md:pt-32">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl dark:text-white">
            The Ultimate{' '}
            <span className="text-blue-600">Sales Operating System</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-slate-600 md:text-xl dark:text-slate-400">
            Orchestrate your entire sales cycle from lead generation to closing.
            AI-powered intelligence for modern revenue teams.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button
                variant="primary"
                className="h-12 w-full px-8 text-lg sm:w-auto"
              >
                Start Free Trial <ChevronRight className="ml-2 size-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button
                variant="outline"
                className="h-12 w-full px-8 text-lg sm:w-auto"
              >
                Watch Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-white py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Why SalesOS?
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Everything you need to scale your revenue engine.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<Target className="size-8 text-blue-500" />}
                title="Precision Prospecting"
                description="Identify high-intent leads with AI-driven market intelligence and enrichment."
              />
              <FeatureCard
                icon={<Zap className="size-8 text-yellow-500" />}
                title="Automated Outreach"
                description="Execute multi-channel sequences across Email, LinkedIn, and Phone effortlessly."
              />
              <FeatureCard
                icon={<BarChart className="size-8 text-green-500" />}
                title="Revenue Intelligence"
                description="Forecast with confidence using predictive analytics and deal scoring."
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <p className="mb-8 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Trusted by forward-thinking teams
            </p>
            <div className="flex justify-center gap-8 opacity-50 grayscale">
              {/* Placeholders for logos */}
              <div className="h-8 w-24 rounded bg-slate-300"></div>
              <div className="h-8 w-24 rounded bg-slate-300"></div>
              <div className="h-8 w-24 rounded bg-slate-300"></div>
              <div className="h-8 w-24 rounded bg-slate-300"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-24 text-center text-white">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Ready to transform your sales process?
            </h2>
            <p className="mb-8 text-lg text-blue-100">
              Join thousands of sales professionals crushing their quotas with
              SalesOS.
            </p>
            <Link href="/dashboard">
              <Button className="h-12 bg-white px-8 text-lg font-semibold text-blue-600 hover:bg-blue-50">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4">
          <div>
            <span className="text-xl font-bold text-white">SalesOS</span>
            <p className="mt-4 text-sm">
              The all-in-one platform for modern sales teams.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#">Features</Link>
              </li>
              <li>
                <Link href="#">Pricing</Link>
              </li>
              <li>
                <Link href="#">Integrations</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#">About</Link>
              </li>
              <li>
                <Link href="#">Careers</Link>
              </li>
              <li>
                <Link href="#">Blog</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#">Privacy</Link>
              </li>
              <li>
                <Link href="#">Terms</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 w-fit rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </Card>
  );
}
