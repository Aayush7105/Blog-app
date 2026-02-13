"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  Sun,
  Moon,
  Calendar,
  Clock,
} from "lucide-react";

type ThemeMode = "light" | "dark";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [userPosts, setUserPosts] = useState<
    {
      _id: string;
      title: string;
      excerpt: string;
      date: string;
      category: string;
      image: string;
      readTime: string;
    }[]
  >([]);
  const [userPostsLoading, setUserPostsLoading] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (localStorage.getItem("theme") as ThemeMode | null)
        : null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const loadUserPosts = async () => {
      if (!session?.user?.email) {
        setUserPosts([]);
        return;
      }
      try {
        setUserPostsLoading(true);
        const res = await fetch(
          `/api/blogs/author/${encodeURIComponent(session.user.email)}`
        );
        const data = await res.json();
        if (data.success) {
          setUserPosts(data.posts);
        }
      } catch (err) {
        console.error("Error loading user posts:", err);
      } finally {
        setUserPostsLoading(false);
      }
    };

    loadUserPosts();
  }, [session?.user?.email]);

  const isDark = theme === "dark";
  const containerClass = useMemo(
    () =>
      isDark
        ? "min-h-screen bg-neutral-950 text-neutral-200 flex flex-col relative overflow-hidden bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_80%_0%,rgba(255,255,255,0.04),transparent_50%),linear-gradient(180deg,#0a0a0a,#0f0f0f)]"
        : "min-h-screen text-slate-900 flex flex-col relative overflow-hidden bg-[radial-gradient(1200px_circle_at_20%_-10%,#f1f5f9,transparent_55%),radial-gradient(900px_circle_at_80%_-15%,#e5e7eb,transparent_50%),linear-gradient(180deg,#fafafa,#f4f4f5)]",
    [isDark]
  );

  const handleStartWriting = async () => {
    if (!session) {
      return signIn("google");
    }
    router.push("/blogapp");
  };

  return (
    <div className={containerClass}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl ${
            isDark
              ? "bg-gradient-to-br from-cyan-500/30 via-sky-500/10 to-transparent"
              : "bg-gradient-to-br from-amber-300/50 via-orange-200/30 to-transparent"
          }`}
        />
        <div
          className={`absolute top-32 -right-28 h-96 w-96 rounded-full blur-3xl ${
            isDark
              ? "bg-gradient-to-br from-rose-500/25 via-fuchsia-500/10 to-transparent"
              : "bg-gradient-to-br from-sky-300/40 via-cyan-200/20 to-transparent"
          }`}
        />
        <div
          className={`absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-3xl ${
            isDark
              ? "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent"
              : "bg-gradient-to-br from-emerald-200/40 via-lime-200/20 to-transparent"
          }`}
        />
      </div>
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 border-b ${
          isDark
            ? "bg-neutral-950/70 border-neutral-800"
            : "bg-white/70 border-slate-200"
        } backdrop-blur-xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  isDark
                    ? "bg-neutral-300 text-neutral-900"
                    : "bg-slate-900 text-white"
                }`}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                TechBlog
              </span>
            </div>

            <div className="flex items-center gap-3">
              {session?.user?.email && (
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isDark
                      ? "text-neutral-300 hover:text-white hover:bg-white/10"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Profile
                </Link>
              )}
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isDark
                    ? "bg-neutral-300 text-neutral-900 hover:bg-neutral-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4" /> Light
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" /> Dark
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div
            className={`rounded-3xl p-[1px] shadow-[0_25px_70px_-50px_rgba(0,0,0,0.6)] ${
              isDark
                ? "bg-gradient-to-br from-cyan-500/30 via-neutral-900/70 to-rose-500/30"
                : "bg-gradient-to-br from-amber-200 via-white to-sky-200"
            }`}
          >
            <div
              className={`grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center rounded-3xl p-8 md:p-12 border ${
                isDark
                  ? "bg-neutral-950/80 border-neutral-800"
                  : "bg-white/80 border-slate-200"
              } backdrop-blur-2xl`}
            >
              <div>
              <p
                className={`text-xs font-semibold uppercase tracking-widest ${
                  isDark ? "text-neutral-300" : "text-slate-500"
                }`}
              >
                Build. Publish. Grow.
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold mt-4 leading-tight">
                Share your tech knowledge with clarity and style.
              </h1>
              <p
                className={`mt-4 text-lg ${
                  isDark ? "text-neutral-300" : "text-slate-600"
                }`}
              >
                TechBlog is the calm, modern publishing space for developers
                who want their writing to look as sharp as their ideas.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={handleStartWriting}
                  className={`px-8 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2 shadow-lg ${
                    isDark
                      ? "bg-gradient-to-r from-cyan-300 to-emerald-300 text-neutral-900 hover:from-cyan-200 hover:to-emerald-200 shadow-cyan-500/20"
                      : "bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 hover:from-amber-300 hover:to-orange-400 shadow-amber-500/20"
                  }`}
                >
                  Start Writing <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  className={`px-8 py-3 rounded-lg font-semibold transition border ${
                    isDark
                      ? "border-neutral-700 text-neutral-200 hover:bg-white/10"
                      : "border-slate-300 text-slate-700 hover:bg-white/70"
                  }`}
                >
                  Read Articles
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div
                className={`rounded-2xl p-6 shadow-sm border ${
                  isDark
                    ? "bg-gradient-to-br from-neutral-900 via-neutral-900/80 to-neutral-800 text-neutral-200 border-neutral-800"
                    : "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white border-slate-800"
                }`}
              >
                <p className="text-xs uppercase tracking-widest text-neutral-300">
                  Featured Insight
                </p>
                <h3 className="text-xl font-semibold mt-3">
                  Building a thoughtful developer blog in 2025
                </h3>
                <p className="text-sm text-neutral-300 mt-3">
                  A short guide to editorial clarity, visual polish, and
                  sustainable writing habits.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`rounded-2xl p-4 shadow-sm border transition hover:-translate-y-1 ${
                    isDark
                      ? "bg-neutral-950/70 border-neutral-800"
                      : "bg-white/90 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase ${
                      isDark ? "text-neutral-300" : "text-slate-500"
                    }`}
                  >
                    Active writers
                  </p>
                  <p className="text-xl font-semibold mt-2">1.2k+</p>
                </div>
                <div
                  className={`rounded-2xl p-4 shadow-sm border transition hover:-translate-y-1 ${
                    isDark
                      ? "bg-neutral-950/70 border-neutral-800"
                      : "bg-white/90 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase ${
                      isDark ? "text-neutral-300" : "text-slate-500"
                    }`}
                  >
                    Monthly reads
                  </p>
                  <p className="text-xl font-semibold mt-2">48k</p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Why Choose TechBlog?
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${
                isDark ? "text-neutral-300" : "text-slate-600"
              }`}
            >
              Everything you need to share your expertise and connect with the
              tech community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={`p-8 rounded-2xl hover:shadow-lg transition hover:-translate-y-1 border ${
                isDark
                  ? "bg-neutral-950/80 border-neutral-800"
                  : "bg-white/80 border-slate-200"
              } backdrop-blur-2xl`}
            >
              <Zap
                className={`h-10 w-10 mb-4 ${
                  isDark ? "text-neutral-300" : "text-slate-900"
                }`}
              />
              <h3 className="text-xl font-semibold mb-3">Easy to Use</h3>
              <p className={isDark ? "text-neutral-300" : "text-slate-600"}>
                Intuitive editor and simple publishing process. Get your article
                live in minutes, not hours.
              </p>
            </div>

            <div
              className={`p-8 rounded-2xl hover:shadow-lg transition hover:-translate-y-1 border ${
                isDark
                  ? "bg-neutral-950/80 border-neutral-800"
                  : "bg-white/80 border-slate-200"
              } backdrop-blur-2xl`}
            >
              <Users
                className={`h-10 w-10 mb-4 ${
                  isDark ? "text-neutral-300" : "text-slate-900"
                }`}
              />
              <h3 className="text-xl font-semibold mb-3">
                Grow Your Audience
              </h3>
              <p className={isDark ? "text-neutral-300" : "text-slate-600"}>
                Reach thousands of tech enthusiasts. Build your personal brand
                and establish thought leadership.
              </p>
            </div>

            <div
              className={`p-8 rounded-2xl hover:shadow-lg transition hover:-translate-y-1 border ${
                isDark
                  ? "bg-neutral-950/80 border-neutral-800"
                  : "bg-white/80 border-slate-200"
              } backdrop-blur-2xl`}
            >
              <Sparkles
                className={`h-10 w-10 mb-4 ${
                  isDark ? "text-neutral-300" : "text-slate-900"
                }`}
              />
              <h3 className="text-xl font-semibold mb-3">
                Professional Design
              </h3>
              <p className={isDark ? "text-neutral-300" : "text-slate-600"}>
                Beautiful templates and responsive layouts. Your articles look
                great on all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center">
          Explore Topics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Development", "Design", "Technology", "Tutorial"].map(
            (category) => (
              <div
                key={category}
                className={`p-6 rounded-2xl shadow-sm hover:shadow-lg transition cursor-pointer hover:-translate-y-1 border ${
                  isDark
                    ? "bg-neutral-950/80 border-neutral-800"
                    : "bg-white/80 border-slate-200"
                } backdrop-blur-2xl`}
              >
                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                <p
                  className={
                    isDark ? "text-neutral-300 text-sm" : "text-slate-600 text-sm"
                  }
                >
                  Explore {category.toLowerCase()} articles
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl p-[1px] ${
              isDark
                ? "bg-gradient-to-r from-cyan-500/40 via-neutral-800/80 to-rose-500/40"
                : "bg-gradient-to-r from-amber-200 via-white to-sky-200"
            }`}
          >
            <div className="bg-neutral-950/90 text-white rounded-3xl p-10 md:p-12 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold">
                  Ready to share your knowledge?
                </h2>
                <p className="text-neutral-300 mt-4 text-lg">
                  Join hundreds of developers and tech enthusiasts who are
                  already sharing their insights on TechBlog.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 md:justify-end">
                <button
                  onClick={handleStartWriting}
                  className="bg-gradient-to-r from-cyan-300 to-emerald-300 text-neutral-900 px-8 py-3 rounded-lg font-semibold hover:from-cyan-200 hover:to-emerald-200 transition inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  Create Your First Post <ArrowRight className="h-5 w-5" />
                </button>
                <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                  View Community
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="h-9 w-9 rounded-lg bg-neutral-300 text-neutral-900 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="ml-3 text-xl font-semibold">TechBlog</span>
            </div>
            <p className="text-neutral-300">
              Your daily dose of tech insights and tutorials.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-neutral-300">
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
            <ul className="space-y-2 text-neutral-300">
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
              <Github className="h-6 w-6 text-neutral-300 hover:text-white cursor-pointer transition" />
              <Twitter className="h-6 w-6 text-neutral-300 hover:text-white cursor-pointer transition" />
              <Linkedin className="h-6 w-6 text-neutral-300 hover:text-white cursor-pointer transition" />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-300">
          <p>(c) 2025 TechBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
