"use client";
import React from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  ArrowRight,
  Zap,
  Users,
  Sparkles,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartWriting = async () => {
    if (!session) {
      // If user is not logged in, sign in first
      return signIn("google");
    }

    // If user is logged in, redirect to blog app page
    router.push("/blogapp");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col bg-[radial-gradient(1200px_circle_at_20%_-10%,#e2e8f0,transparent_55%),radial-gradient(900px_circle_at_80%_-15%,#e5e7eb,transparent_50%)]">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                TechBlog
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Build. Publish. Grow.
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold mt-4 leading-tight">
                Share your tech knowledge with clarity and style.
              </h1>
              <p className="text-slate-600 mt-4 text-lg">
                TechBlog is the calm, modern publishing space for developers
                who want their writing to look as sharp as their ideas.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={handleStartWriting}
                  className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition inline-flex items-center gap-2"
                >
                  Start Writing <ArrowRight className="h-5 w-5" />
                </button>

                <button className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition">
                  Read Articles
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-300">
                  Featured Insight
                </p>
                <h3 className="text-xl font-semibold mt-3">
                  Building a thoughtful developer blog in 2025
                </h3>
                <p className="text-sm text-slate-300 mt-3">
                  A short guide to editorial clarity, visual polish, and
                  sustainable writing habits.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Active writers
                  </p>
                  <p className="text-xl font-semibold mt-2">1.2k+</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Monthly reads
                  </p>
                  <p className="text-xl font-semibold mt-2">48k</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
              Why Choose TechBlog?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Everything you need to share your expertise and connect with the
              tech community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white/80 border border-slate-200 rounded-2xl hover:shadow-md transition">
              <Zap className="h-10 w-10 text-slate-900 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Easy to Use
              </h3>
              <p className="text-slate-600">
                Intuitive editor and simple publishing process. Get your article
                live in minutes, not hours.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white/80 border border-slate-200 rounded-2xl hover:shadow-md transition">
              <Users className="h-10 w-10 text-slate-900 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Grow Your Audience
              </h3>
              <p className="text-slate-600">
                Reach thousands of tech enthusiasts. Build your personal brand
                and establish thought leadership.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white/80 border border-slate-200 rounded-2xl hover:shadow-md transition">
              <Sparkles className="h-10 w-10 text-slate-900 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Professional Design
              </h3>
              <p className="text-slate-600">
                Beautiful templates and responsive layouts. Your articles look
                great on all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-12 text-center">
          Explore Topics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Development", "Design", "Technology", "Tutorial"].map(
            (category) => (
              <div
                key={category}
                className="bg-white/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer border border-slate-200 hover:border-slate-300"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {category}
                </h3>
                <p className="text-slate-600 text-sm">
                  Explore {category.toLowerCase()} articles
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-10 md:p-12 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold">
                Ready to share your knowledge?
              </h2>
              <p className="text-slate-300 mt-4 text-lg">
                Join hundreds of developers and tech enthusiasts who are
                already sharing their insights on TechBlog.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <button
                onClick={handleStartWriting}
                className="bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition inline-flex items-center gap-2"
              >
                Create Your First Post <ArrowRight className="h-5 w-5" />
              </button>
              <button className="border border-white/40 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                View Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="h-9 w-9 rounded-lg bg-white/10 text-white flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="ml-3 text-xl font-semibold">TechBlog</span>
            </div>
            <p className="text-slate-300">
              Your daily dose of tech insights and tutorials.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a className="hover:text-white transition" href="#">
                  Home
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Articles
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a className="hover:text-white transition" href="#">
                  Development
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Design
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Technology
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <Github className="h-6 w-6 text-slate-300 hover:text-white cursor-pointer transition" />
              <Twitter className="h-6 w-6 text-slate-300 hover:text-white cursor-pointer transition" />
              <Linkedin className="h-6 w-6 text-slate-300 hover:text-white cursor-pointer transition" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>(c) 2025 TechBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
