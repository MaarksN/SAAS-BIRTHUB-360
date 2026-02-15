"use client";

import { Button } from "@salesos/ui";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="shrink-0">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">SalesOS</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="#features" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                  Features
                </Link>
                <Link href="#pricing" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                  Pricing
                </Link>
                <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4 md:ml-6">
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
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block size-6" /> : <Menu className="block size-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 border-b border-slate-200 bg-white px-2 pb-3 pt-2 sm:px-3 dark:border-slate-800 dark:bg-slate-900">
            <Link href="#features" className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300">
              Features
            </Link>
            <Link href="#pricing" className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300">
              Pricing
            </Link>
            <Link href="/dashboard" className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300">
              Dashboard
            </Link>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
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
