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
        ? "min-h-screen bg-neutral-900 text-neutral-300 flex flex-col"
        : "min-h-screen bg-slate-50 text-slate-900 flex flex-col bg-[radial-gradient(1200px_circle_at_20%_-10%,#e2e8f0,transparent_55%),radial-gradient(900px_circle_at_80%_-15%,#e5e7eb,transparent_50%)]",
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
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 border-b ${
          isDark
            ? "bg-neutral-900/80 border-neutral-700"
            : "bg-white/80 border-slate-200"
        } backdrop-blur`}
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
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div
            className={`grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center rounded-3xl p-8 md:p-12 shadow-sm border ${
              isDark
                ? "bg-neutral-900/70 border-neutral-700"
                : "bg-white/80 border-slate-200"
            } backdrop-blur`}
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
                  className={`px-8 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2 ${
                    isDark
                      ? "bg-neutral-300 text-neutral-900 hover:bg-neutral-200"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  Start Writing <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  className={`px-8 py-3 rounded-lg font-semibold transition border ${
                    isDark
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Read Articles
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div
                className={`rounded-2xl p-6 shadow-sm ${
                  isDark
                    ? "bg-neutral-700 text-neutral-300"
                    : "bg-slate-900 text-white"
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
                  className={`rounded-2xl p-4 shadow-sm border ${
                    isDark
                      ? "bg-neutral-900/70 border-neutral-700"
                      : "bg-white border-slate-200"
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
                  className={`rounded-2xl p-4 shadow-sm border ${
                    isDark
                      ? "bg-neutral-900/70 border-neutral-700"
                      : "bg-white border-slate-200"
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
      </section>

      {/* User Posts */}
      {session?.user?.email && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div
            className={`rounded-3xl p-6 md:p-8 shadow-sm border mb-8 ${
              isDark
                ? "bg-neutral-900/70 border-neutral-700"
                : "bg-white/80 border-slate-200"
            } backdrop-blur`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-widest ${
                    isDark ? "text-neutral-300" : "text-slate-500"
                  }`}
                >
                  Your Posts
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold mt-2">
                  {session.user.name || "Your"} writing desk
                </h2>
              </div>
              <Link
                href="/profile"
                className={`text-sm font-semibold transition ${
                  isDark
                    ? "text-neutral-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                View profile
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userPostsLoading ? (
              <p className={isDark ? "text-neutral-300" : "text-slate-500"}>
                Loading...
              </p>
            ) : userPosts.length === 0 ? (
              <p className={isDark ? "text-neutral-300" : "text-slate-500"}>
                You have not published any posts yet.
              </p>
            ) : (
              userPosts.map((post) => (
                <article
                  key={post._id}
                  className={`group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border ${
                    isDark
                      ? "bg-neutral-900/70 border-neutral-700"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div
                    className={`aspect-[16/10] ${
                      isDark ? "bg-neutral-700" : "bg-slate-100"
                    }`}
                  >
                    {post.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <span
                      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                        isDark
                          ? "text-neutral-900 bg-neutral-300"
                          : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {post.category}
                    </span>
                    <h3 className="text-lg font-semibold mt-3">{post.title}</h3>
                    <p
                      className={`mt-2 line-clamp-3 ${
                        isDark ? "text-neutral-300" : "text-slate-600"
                      }`}
                    >
                      {post.excerpt}
                    </p>
                    <div
                      className={`flex items-center gap-4 text-xs mt-4 ${
                        isDark ? "text-neutral-300" : "text-slate-500"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> {post.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
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
              className={`p-8 rounded-2xl hover:shadow-md transition border ${
                isDark
                  ? "bg-neutral-900/70 border-neutral-700"
                  : "bg-white/80 border-slate-200"
              }`}
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
              className={`p-8 rounded-2xl hover:shadow-md transition border ${
                isDark
                  ? "bg-neutral-900/70 border-neutral-700"
                  : "bg-white/80 border-slate-200"
              }`}
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
              className={`p-8 rounded-2xl hover:shadow-md transition border ${
                isDark
                  ? "bg-neutral-900/70 border-neutral-700"
                  : "bg-white/80 border-slate-200"
              }`}
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center">
          Explore Topics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Development", "Design", "Technology", "Tutorial"].map(
            (category) => (
              <div
                key={category}
                className={`p-6 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer border ${
                  isDark
                    ? "bg-neutral-900/70 border-neutral-700"
                    : "bg-white/80 border-slate-200"
                }`}
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
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-900 text-white rounded-3xl p-10 md:p-12 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
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
                className="bg-neutral-300 text-neutral-900 px-8 py-3 rounded-lg font-semibold hover:bg-neutral-200 transition inline-flex items-center gap-2"
              >
                Create Your First Post <ArrowRight className="h-5 w-5" />
              </button>
              <button className="border border-white/40 text-white px-8 py-3 rounded-lg font-semibold hover:bg-neutral-700 transition">
                View Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white mt-auto">
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
