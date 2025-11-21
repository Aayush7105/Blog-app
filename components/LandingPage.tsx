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
      // If user is not logged in → Sign in first
      return signIn("google");
    }

    // If user is logged in → redirect to blog app page
    router.push("/blogapp");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold text-neutral-900">
                TechBlog
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Share Your Tech Knowledge with the World
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Create, publish, and grow your audience with TechBlog. A modern
              platform for developers and tech enthusiasts to share insights,
              tutorials, and stories.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleStartWriting}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
              >
                Start Writing <ArrowRight className="h-5 w-5" />
              </button>

              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                Read Articles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose TechBlog?
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              Everything you need to share your expertise and connect with the
              tech community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-neutral-50 rounded-lg hover:shadow-lg transition">
              <Zap className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Easy to Use
              </h3>
              <p className="text-neutral-600">
                Intuitive editor and simple publishing process. Get your article
                live in minutes, not hours.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-neutral-50 rounded-lg hover:shadow-lg transition">
              <Users className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Grow Your Audience
              </h3>
              <p className="text-neutral-600">
                Reach thousands of tech enthusiasts. Build your personal brand
                and establish thought leadership.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-neutral-50 rounded-lg hover:shadow-lg transition">
              <Sparkles className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Professional Design
              </h3>
              <p className="text-neutral-600">
                Beautiful templates and responsive layouts. Your articles look
                great on all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
          Explore Topics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Development", "Design", "Technology", "Tutorial"].map(
            (category) => (
              <div
                key={category}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer border border-neutral-200 hover:border-indigo-300"
              >
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {category}
                </h3>
                <p className="text-neutral-600 text-sm">
                  Explore {category.toLowerCase()} articles
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Share Your Knowledge?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of developers and tech enthusiasts who are already
            sharing their insights on TechBlog.
          </p>
          <button
            onClick={handleStartWriting}
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2 mx-auto"
          >
            Create Your First Post <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">TechBlog</span>
            </div>
            <p className="text-neutral-400">
              Your daily dose of tech insights and tutorials.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-neutral-400">
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
            <ul className="space-y-2 text-neutral-400">
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
              <Github className="h-6 w-6 text-neutral-400 hover:text-white cursor-pointer transition" />
              <Twitter className="h-6 w-6 text-neutral-400 hover:text-white cursor-pointer transition" />
              <Linkedin className="h-6 w-6 text-neutral-400 hover:text-white cursor-pointer transition" />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>© 2025 TechBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
