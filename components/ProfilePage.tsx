"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, Sun, Moon } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  author: string;
  authorEmail?: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
}

type ThemeMode = "light" | "dark";

export default function ProfilePage({ email }: { email: string }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    image?: string;
  } | null>(null);

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
    const load = async () => {
      try {
        setLoading(true);
        const userRes = await fetch(
          `/api/users/${encodeURIComponent(email)}`
        );
        const userData = await userRes.json();
        if (userData.success) {
          setProfile(userData.user);
        }

        const res = await fetch(
          `/api/blogs/author/${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error("Error loading profile blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    if (email) load();
  }, [email]);

  const isDark = theme === "dark";
  const displayName = profile?.name || posts[0]?.author || "Author";

  const containerClass = useMemo(
    () =>
      isDark
        ? "min-h-screen bg-neutral-900 text-neutral-300 flex flex-col"
        : "min-h-screen bg-slate-50 text-slate-900 flex flex-col bg-[radial-gradient(1200px_circle_at_20%_-10%,#e2e8f0,transparent_55%),radial-gradient(900px_circle_at_80%_-15%,#e5e7eb,transparent_50%)]",
    [isDark]
  );

  return (
    <div className={containerClass}>
      <nav
        className={`sticky top-0 z-50 border-b ${
          isDark
            ? "bg-neutral-900/80 border-neutral-700"
            : "bg-white/80 border-slate-200"
        } backdrop-blur`}
      >
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                isDark ? "bg-neutral-300 text-neutral-900" : "bg-slate-900 text-white"
              }`}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              TechBlog
            </span>
          </div>

          <div className="flex items-center gap-3">
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
            <Link
              href="/blogapp"
              className={`text-sm font-medium ${
                isDark
                  ? "text-neutral-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              Back to blog
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto w-full px-4 pt-10 pb-6">
        <div
          className={`rounded-3xl p-8 md:p-10 shadow-sm border ${
            isDark
              ? "bg-neutral-900/70 border-neutral-700"
              : "bg-white/80 border-slate-200"
          } backdrop-blur`}
        >
          <div className="flex flex-wrap items-center gap-6">
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-semibold overflow-hidden ${
                isDark
                  ? "bg-neutral-300 text-neutral-900"
                  : "bg-slate-900 text-white"
              }`}
            >
              {profile?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-widest ${
                  isDark ? "text-neutral-300" : "text-slate-500"
                }`}
              >
                Author Profile
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mt-2">
                {displayName}
              </h1>
              <p className={isDark ? "text-neutral-300" : "text-slate-600"}>
                {profile?.email || email}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-4 pb-16">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${
                isDark ? "text-neutral-300" : "text-slate-500"
              }`}
            >
              Posts by {displayName}
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold mt-2">
              Writing archive
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className={isDark ? "text-neutral-300" : "text-slate-500"}>
              Loading...
            </p>
          ) : posts.length === 0 ? (
            <p className={isDark ? "text-neutral-300" : "text-slate-500"}>
              No posts yet.
            </p>
          ) : (
            posts.map((post) => (
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
    </div>
  );
}
