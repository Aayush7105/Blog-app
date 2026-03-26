"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  ArrowRight,
  Zap,
  Users,
  Sparkles,
  Github,
  Twitter,
  Linkedin,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
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
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadUserPosts = async () => {
      if (!session?.user?.email) {
        setUserPosts([]);
        return;
      }
      try {
        setUserPostsLoading(true);
        const res = await fetch(
          `/api/blogs/author/${encodeURIComponent(session.user.email)}`,
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

  useEffect(() => {
    const loadProfileImage = async () => {
      if (!session?.user?.email) {
        setProfileImage(null);
        setIsProfileMenuOpen(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/users/${encodeURIComponent(session.user.email)}`,
        );
        const data = await res.json();
        if (data.success && data.user?.image) {
          setProfileImage(data.user.image);
          return;
        }
      } catch (err) {
        console.error("Error loading profile image:", err);
      }

      setProfileImage(session.user.image ?? null);
    };

    loadProfileImage();
  }, [session?.user?.email, session?.user?.image]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const fallbackAvatar = session?.user?.email
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        session.user.email,
      )}&size=96&background=0f172a&color=ffffff`
    : "";
  const avatarSrc = profileImage || fallbackAvatar;
  const containerClass = useMemo(
    () =>
      isDark
        ? "min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden"
        : "min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden",
    [isDark],
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
          className={`absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl ${
            isDark ? "bg-blue-500/10" : "bg-blue-400/15"
          }`}
        />
        <div
          className={`absolute top-40 -right-40 h-96 w-96 rounded-full blur-3xl ${
            isDark ? "bg-blue-400/8" : "bg-blue-300/10"
          }`}
        />
        <div
          className={`absolute bottom-20 left-1/4 h-72 w-72 rounded-full blur-3xl ${
            isDark ? "bg-blue-500/5" : "bg-blue-200/8"
          }`}
        />
      </div>
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 border-b ${
          isDark
            ? "bg-background/80 border-border"
            : "bg-background/80 border-border"
        } backdrop-blur-md transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isDark
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                TB
              </div>
              <span className="text-lg font-bold tracking-tight">TechBlog</span>
            </div>

            <div className="flex items-center gap-2">
              {session?.user?.email && (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className={`h-10 w-10 rounded-full overflow-hidden border transition duration-300 inline-flex items-center justify-center ${
                      isDark
                        ? "border-border hover:border-accent/40"
                        : "border-border hover:border-accent/40"
                    }`}
                    aria-label="Open profile menu"
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarSrc}
                      alt={`${session.user.name || session.user.email} profile`}
                      className="h-full w-full object-cover"
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-40 rounded-lg border shadow-lg overflow-hidden ${
                        isDark
                          ? "bg-card border-border"
                          : "bg-card border-border"
                      }`}
                      role="menu"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className={`block px-4 py-2 text-sm transition ${
                          isDark
                            ? "text-foreground hover:bg-secondary"
                            : "text-foreground hover:bg-secondary"
                        }`}
                        role="menuitem"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          signOut();
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition ${
                          isDark
                            ? "text-foreground hover:bg-secondary"
                            : "text-foreground hover:bg-secondary"
                        }`}
                        role="menuitem"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                <span className="text-xs font-semibold text-foreground">
                  Build. Publish. Grow.
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6 text-balance">
                Share your tech knowledge with clarity and style
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
                TechBlog is the modern publishing space for developers who want
                their writing to look as sharp as their ideas. Beautiful, fast,
                and designed for growth.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleStartWriting}
                  className="px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:shadow-lg hover:shadow-accent/20 active:scale-95"
                >
                  Start Writing <ArrowRight className="h-5 w-5" />
                </button>

                <button className="px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 border border-border bg-background text-foreground hover:bg-secondary active:scale-95">
                  Read Articles
                </button>
              </div>
            </div>

            <div
              className="grid gap-4 animate-fade-in-down"
              style={{ animationDelay: "0.1s" }}
            >
              <div
                className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 ${
                  isDark ? "bg-card border-border" : "bg-card border-border"
                }`}
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  Featured Insight
                </p>
                <h3 className="text-xl font-bold leading-tight mb-3">
                  Building a thoughtful developer blog
                </h3>
                <p className="text-sm text-muted-foreground">
                  A guide to editorial clarity, visual polish, and sustainable
                  writing habits for the modern developer.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`rounded-xl p-4 border transition-all duration-300 hover:shadow-md hover:shadow-accent/10 hover:-tranneutral-y-1 ${
                    isDark ? "bg-card border-border" : "bg-card border-border"
                  }`}
                >
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                    Active Writers
                  </p>
                  <p className="text-2xl font-bold">1.2k+</p>
                </div>
                <div
                  className={`rounded-xl p-4 border transition-all duration-300 hover:shadow-md hover:shadow-accent/10 hover:-tranneutral-y-1 ${
                    isDark ? "bg-card border-border" : "bg-card border-border"
                  }`}
                >
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                    Monthly Reads
                  </p>
                  <p className="text-2xl font-bold">48k</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Why Choose TechBlog?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to share your expertise and connect with the
              developer community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Easy to Use",
                desc: "Intuitive editor and simple publishing process. Get your article live in minutes, not hours.",
              },
              {
                icon: Users,
                title: "Grow Your Audience",
                desc: "Reach thousands of tech enthusiasts. Build your personal brand and establish thought leadership.",
              },
              {
                icon: Sparkles,
                title: "Professional Design",
                desc: "Beautiful templates and responsive layouts. Your articles look great on all devices.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`p-8 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-tranneutral-y-1 group cursor-pointer ${
                    isDark
                      ? "bg-card border-border hover:border-accent/50"
                      : "bg-card border-border hover:border-accent/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-balance">
          Explore Topics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Development", "Design", "Technology", "Tutorial"].map(
            (category, idx) => (
              <div
                key={category}
                className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-accent/10 hover:-tranneutral-y-1 group ${
                  isDark
                    ? "bg-card border-border hover:border-accent/50"
                    : "bg-card border-border hover:border-accent/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold">{category}</h3>
                  <ChevronRight className="h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Explore {category.toLowerCase()} content
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-2xl p-0.5 transition-all duration-300 ${
              isDark
                ? "bg-gradient-to-r from-accent/30 via-accent/10 to-accent/30"
                : "bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20"
            }`}
          >
            <div
              className={`rounded-2xl p-12 md:p-16 grid gap-8 md:grid-cols-[1.3fr_0.7fr] items-center ${
                isDark
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-balance">
                  Ready to share your knowledge?
                </h2>
                <p className="text-lg opacity-90">
                  Join thousands of developers and tech enthusiasts already
                  sharing their insights on TechBlog. Build your audience and
                  establish your voice in the tech community.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:justify-end">
                <button
                  onClick={handleStartWriting}
                  className="bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-bold hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 inline-flex items-center justify-center gap-2 active:scale-95"
                >
                  Start Writing <ArrowRight className="h-5 w-5" />
                </button>
                <button className="border-2 border-white/30 text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
                  View Community
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`mt-auto relative z-10 ${isDark ? "bg-background border-t border-border" : "bg-background border-t border-border"}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${isDark ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}
              >
                TB
              </div>
              <span className="text-lg font-bold">TechBlog</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The modern platform for developers to share insights, build
              audiences, and establish thought leadership in the tech community.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  className="hover:text-accent transition-colors duration-300"
                  href="#"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors duration-300"
                  href="#"
                >
                  Articles
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors duration-300"
                  href="#"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors duration-300"
                  href="#"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-foreground">Topics</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  className="hover:text-accent transition-colors duration-300"
                  href="#"
                >
                  Development
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors duration-300"
                  href="#"
                >
                  Design
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors duration-300"
                  href="#"
                >
                  Technology
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-foreground">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-secondary transition-all duration-300"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-secondary transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-secondary transition-all duration-300"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>© 2025 TechBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
