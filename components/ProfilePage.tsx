"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BookOpen, Calendar, Clock, Layers } from "lucide-react";

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

const parseReadMinutes = (readTime: string) => {
  const match = readTime.match(/\d+/);
  if (!match) return 0;
  const minutes = Number.parseInt(match[0], 10);
  return Number.isNaN(minutes) ? 0 : minutes;
};

export default function ProfilePage({ email }: { email: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const userRes = await fetch(`/api/users/${encodeURIComponent(email)}`);
        const userData = await userRes.json();
        if (userData.success) {
          setProfile(userData.user);
        }

        const res = await fetch(
          `/api/blogs/author/${encodeURIComponent(email)}`,
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

  const isDark = mounted && resolvedTheme === "dark";
  const displayName = profile?.name || posts[0]?.author || "Author";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "A";
  const isInitialLoading = loading && posts.length === 0;

  const stats = useMemo(() => {
    const categoryCount = new Set(
      posts.map((post) => post.category).filter(Boolean),
    ).size;
    const totalReadMinutes = posts.reduce(
      (total, post) => total + parseReadMinutes(post.readTime),
      0,
    );

    return [
      { label: "Published posts", value: posts.length, icon: BookOpen },
      { label: "Categories", value: categoryCount, icon: Layers },
      { label: "Reading minutes", value: totalReadMinutes, icon: Clock },
    ];
  }, [posts]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-28 h-80 w-80 rounded-full blur-3xl ${
            isDark ? "bg-cyan-400/15" : "bg-sky-300/30"
          }`}
        />
        <div
          className={`absolute top-24 -right-28 h-[22rem] w-[22rem] rounded-full blur-3xl ${
            isDark ? "bg-blue-500/12" : "bg-indigo-300/25"
          }`}
        />
        <div
          className={`absolute bottom-16 left-1/3 h-72 w-72 rounded-full blur-3xl ${
            isDark ? "bg-teal-500/8" : "bg-cyan-200/25"
          }`}
        />
      </div>

      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              TechBlog
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blogapp"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Back to blog
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1">
        <section className="max-w-7xl mx-auto w-full px-4 pt-10 pb-6">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 shadow-sm border border-border bg-card/80 backdrop-blur">
            <div
              className={`pointer-events-none absolute inset-0 ${
                isDark
                  ? "bg-[radial-gradient(650px_circle_at_8%_-10%,rgba(34,211,238,0.14),transparent_55%),radial-gradient(560px_circle_at_92%_0%,rgba(59,130,246,0.12),transparent_55%)]"
                  : "bg-[radial-gradient(650px_circle_at_8%_-10%,rgba(14,165,233,0.14),transparent_55%),radial-gradient(560px_circle_at_92%_0%,rgba(59,130,246,0.10),transparent_55%)]"
              }`}
            />

            <div className="relative flex flex-col gap-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-semibold overflow-hidden bg-primary text-primary-foreground ring-4 ring-background/70">
                    {profile?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.image}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      avatarInitial
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Author Profile
                    </p>
                    <h1 className="text-3xl md:text-4xl font-semibold mt-2 text-balance">
                      {displayName}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {profile?.email || email}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active Writer
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border bg-background/60 px-4 py-4"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="h-4 w-4" />
                        <p className="text-xs font-semibold uppercase tracking-wide">
                          {stat.label}
                        </p>
                      </div>
                      <p className="mt-2 text-2xl font-semibold">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto w-full px-4 pb-16">
          <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Posts by {displayName}
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold mt-2">
                Writing archive
              </h2>
            </div>
            <div className="inline-flex items-center rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isInitialLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm"
                >
                  <div className="aspect-[16/10] bg-secondary animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 w-24 rounded-full bg-secondary animate-pulse" />
                    <div className="h-5 w-3/4 rounded-md bg-secondary animate-pulse" />
                    <div className="h-4 w-full rounded-md bg-secondary animate-pulse" />
                    <div className="h-4 w-5/6 rounded-md bg-secondary animate-pulse" />
                    <div className="h-4 w-1/2 rounded-md bg-secondary animate-pulse" />
                  </div>
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold mt-4">No posts yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This author has not published any articles yet.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post._id}
                  className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-border bg-card hover:-tranneutral-y-1"
                >
                  <div className="relative aspect-[16/10] bg-secondary">
                    {post.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-[1.04] transition duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <BookOpen className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {post.category || "General"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {post.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mt-3 text-balance">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs mt-4 text-muted-foreground">
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
      </main>
    </div>
  );
}
