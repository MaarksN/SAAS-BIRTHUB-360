"use client";

import Link from "next/link";
import { Button } from "@salesos/ui";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">SalesOS</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </Link>
                <Link href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <Link href="/auth/login">
                <Button variant="secondary">Log In</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <Link href="#features" className="text-slate-600 dark:text-slate-300 block px-3 py-2 rounded-md text-base font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-slate-600 dark:text-slate-300 block px-3 py-2 rounded-md text-base font-medium">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
               <Link href="/auth/login" className="w-full">
                <Button variant="secondary" className="w-full justify-center">Log In</Button>
              </Link>
              <Link href="/auth/register" className="w-full">
                <Button variant="primary" className="w-full justify-center">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
