"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  User,
  ArrowLeft,
  Clock,
  Calendar,
  Plus,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { signIn, signOut, useSession } from "next-auth/react";
import CustomEditor from "./CustomEditor";

// --- Interfaces ---
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
  content: string;
}

type ThemeMode = "light" | "dark";

const AUTO_COVER_GRADIENTS = [
  "from-zinc-300 via-neutral-500 to-zinc-800",
  "from-stone-300 via-neutral-500 to-stone-900",
  "from-neutral-300 via-gray-500 to-zinc-800",
  "from-gray-300 via-neutral-500 to-neutral-900",
  "from-neutral-400 via-stone-500 to-neutral-800",
  "from-stone-400 via-gray-600 to-zinc-900",
];

const COVER_STYLE_GRADIENTS: Record<string, string> = {
  sunset: "from-stone-300 via-neutral-500 to-zinc-800",
  ocean: "from-neutral-300 via-gray-500 to-zinc-800",
  forest: "from-stone-400 via-neutral-600 to-neutral-900",
  dusk: "from-gray-400 via-neutral-600 to-zinc-900",
  bloom: "from-neutral-200 via-gray-500 to-zinc-800",
};

const coverStyleOptions = [
  { label: "Auto blend", value: "auto" },
  { label: "Stone haze", value: "sunset" },
  { label: "Slate fog", value: "ocean" },
  { label: "Ash mist", value: "forest" },
  { label: "Carbon dusk", value: "dusk" },
  { label: "Silver smoke", value: "bloom" },
];

const hashString = (value: string): number => {
  return value.split("").reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) % 2147483647;
  }, 7);
};

const getCoverGradient = (
  imageToken: string | undefined,
  seed: string,
): string => {
  const normalizedToken = (imageToken || "").toLowerCase().trim();
  if (normalizedToken && normalizedToken in COVER_STYLE_GRADIENTS) {
    return COVER_STYLE_GRADIENTS[normalizedToken];
  }

  const index = hashString(seed + normalizedToken) % AUTO_COVER_GRADIENTS.length;
  return AUTO_COVER_GRADIENTS[index];
};

interface GradientCoverProps {
  title: string;
  category: string;
  readTime?: string;
  imageToken?: string;
  isDark: boolean;
  className?: string;
  compact?: boolean;
}

const GradientCover: React.FC<GradientCoverProps> = ({
  title,
  category,
  readTime,
  imageToken,
  isDark,
  className = "aspect-[16/10]",
  compact = false,
}) => {
  const coverGradient = getCoverGradient(imageToken, `${title}-${category}`);

  return (
    <div
      className={`relative isolate overflow-hidden ${className} bg-gradient-to-br ${coverGradient}`}
    >
      <div className={`absolute inset-0 ${isDark ? "bg-black/22" : "bg-black/12"}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(255,255,255,0.33),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_84%,rgba(0,0,0,0.46),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[linear-gradient(125deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_42%,rgba(0,0,0,0.22)_100%)]" />

      <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
        <span className="inline-flex w-fit items-center rounded-full border border-white/35 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/95 backdrop-blur">
          {category}
        </span>
        <div>
          <h3
            className={`font-semibold leading-tight drop-shadow ${
              compact ? "text-lg" : "text-2xl md:text-3xl"
            }`}
          >
            {title}
          </h3>
          {readTime && (
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-white/80">
              {readTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const BlogApp: React.FC = () => {
  const { data: session } = useSession();

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // NEW: freeze editor initial content so editor does NOT re-render while typing
  const [frozenInitialContent, setFrozenInitialContent] = useState("");
  const [newBlog, setNewBlog] = useState<Partial<BlogPost>>({});

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const isDark = theme === "dark";
  const fallbackAvatar = session?.user?.email
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        session.user.email,
      )}&size=96&background=0f172a&color=ffffff`
    : "";
  const avatarSrc = profileImage || fallbackAvatar;

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

  // Freeze editor content only once when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      setFrozenInitialContent(newBlog.content || "");
    }
  }, [isAddModalOpen, newBlog.content]);

  // Fetch Blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/blogs");
        const data = await res.json();
        if (data.success) setBlogPosts(data.posts);
      } catch (err) {
        console.error("Error loading blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Editor change handler (does NOT push value back to editor)
  const handleEditorChange = useCallback((content: string) => {
    setNewBlog((prev) => ({ ...prev, content }));
  }, []);

  const categories: string[] = ["All", "Development", "Design", "Technology"];

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === selectedCategory);

  const featuredPost = blogPosts[0];
  const modalInputClass = `w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
    isDark
      ? "border-neutral-700 bg-neutral-950/70 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500/40"
      : "border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-neutral-300"
  }`;
  const modalLabelClass = `text-xs font-semibold uppercase tracking-wide ${
    isDark ? "text-neutral-400" : "text-neutral-600"
  }`;
  const themeToggleClass = `inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold backdrop-blur transition ${
    isDark
      ? "border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500 hover:text-white"
      : "border-neutral-200 bg-white/85 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900"
  }`;
  const primaryButtonClass =
    "bg-neutral-300 text-neutral-950 hover:bg-neutral-200";

  // Add Blog
  const handleAddBlog = useCallback(async () => {
    if (
      !newBlog.title ||
      !newBlog.excerpt ||
      !newBlog.category ||
      !newBlog.content
    ) {
      toast("Please fill in all required fields.");
      return;
    }

    const blogData = {
      ...newBlog,
      image: newBlog.image || "auto",
      readTime: newBlog.readTime || "5 min read",
      date: new Date().toLocaleDateString(),
      author: session?.user?.name || "Unknown Author",
    };

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(blogData),
      });

      const data = await res.json();
      if (data.success) {
        setBlogPosts((prev) => [data.post, ...prev]);
        setIsAddModalOpen(false);
        setNewBlog({});
        setFrozenInitialContent("");
      } else {
        alert(`Failed to add blog: ${data.error}`);
      }
    } catch (err) {
      console.error("Error adding blog:", err);
      alert("Error creating blog.");
    }
  }, [newBlog, session]);

  // Delete Blog
  const handleDeleteBlog = useCallback(async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Delete this blog?")) return;

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBlogPosts((prev) => prev.filter((p) => p._id !== id));
        setSelectedPost(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete blog.");
    }
  }, []);

  // Single Post View
  if (selectedPost) {
    return (
      <div
        className={
          isDark
            ? "min-h-screen bg-neutral-950 text-neutral-200 bg-[radial-gradient(920px_circle_at_12%_-10%,rgba(212,212,212,0.13),transparent_56%),radial-gradient(780px_circle_at_96%_0%,rgba(82,82,82,0.24),transparent_52%),linear-gradient(180deg,#0a0a0a_0%,#171717_100%)]"
            : "min-h-screen bg-neutral-50 text-neutral-900 bg-[radial-gradient(1060px_circle_at_8%_-16%,#fafaf9,transparent_56%),radial-gradient(900px_circle_at_95%_0%,#f3f4f6,transparent_52%),linear-gradient(180deg,#fafafa_0%,#f5f5f5_100%)]"
        }
      >
        <nav
          className={`sticky top-0 z-50 border-b ${
            isDark
              ? "bg-neutral-900/80 border-neutral-700"
              : "bg-white/80 border-neutral-200"
          } backdrop-blur`}
        >
          <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  isDark
                    ? "bg-neutral-300 text-neutral-900"
                    : "bg-neutral-900 text-white"
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
                className={themeToggleClass}
                aria-label="Toggle theme"
              >
                {isDark ? <Moon /> : <Sun />}
              </button>
              <button
                onClick={() => setSelectedPost(null)}
                className={`text-sm font-medium ${
                  isDark
                    ? "text-neutral-300 hover:text-white"
                    : "text-neutral-700 hover:text-neutral-900"
                }`}
              >
                Back to all posts
              </button>
            </div>
          </div>
        </nav>

        <article className="max-w-4xl mx-auto px-4 py-10">
          <button
            onClick={() => setSelectedPost(null)}
            className={`inline-flex items-center text-sm font-medium mb-6 ${
              isDark
                ? "text-neutral-300 hover:text-white"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </button>

          <div
            className={`rounded-2xl overflow-hidden shadow-sm border ${
              isDark
                ? "bg-neutral-900/70 border-neutral-700"
                : "bg-white border-neutral-200"
            }`}
          >
            <GradientCover
              title={selectedPost.title}
              category={selectedPost.category}
              readTime={selectedPost.readTime}
              imageToken={selectedPost.image}
              isDark={isDark}
              className="aspect-[16/9]"
            />

            <div className="p-8">
              <div
                className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                  isDark
                    ? "text-neutral-900 bg-neutral-300"
                    : "text-neutral-500 bg-neutral-100"
                }`}
              >
                {selectedPost.category}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold mt-4">
                {selectedPost.title}
              </h1>

              <div
                className={`flex flex-wrap items-center gap-4 text-sm mt-4 ${
                  isDark ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {selectedPost.authorEmail ? (
                    <Link
                      href={`/profile/${encodeURIComponent(
                        selectedPost.authorEmail,
                      )}`}
                      className={
                        isDark ? "hover:text-white" : "hover:text-neutral-900"
                      }
                    >
                      {selectedPost.author}
                    </Link>
                  ) : (
                    <span>{selectedPost.author}</span>
                  )}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {selectedPost.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {selectedPost.readTime}
                </span>
              </div>

              <div
                className="prose max-w-none mt-8"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              ></div>

              <div className="mt-8">
                <button
                  onClick={() => handleDeleteBlog(selectedPost._id)}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                >
                  Delete post
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Home Page
  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-neutral-950 text-neutral-200 flex flex-col bg-[radial-gradient(980px_circle_at_12%_-12%,rgba(212,212,212,0.13),transparent_58%),radial-gradient(820px_circle_at_96%_0%,rgba(82,82,82,0.24),transparent_52%),linear-gradient(180deg,#0a0a0a_0%,#171717_100%)]"
          : "min-h-screen bg-neutral-50 text-neutral-900 flex flex-col bg-[radial-gradient(1200px_circle_at_20%_-10%,#fafaf9,transparent_55%),radial-gradient(980px_circle_at_82%_-14%,#f3f4f6,transparent_50%),linear-gradient(180deg,#fafafa_0%,#f5f5f5_100%)]"
      }
    >
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 border-b ${
          isDark
            ? "bg-neutral-900/80 border-neutral-700"
            : "bg-white/80 border-neutral-200"
        } backdrop-blur`}
      >
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                isDark
                  ? "bg-neutral-300 text-neutral-900"
                  : "bg-neutral-900 text-white"
              }`}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              TechBlog
            </span>
          </div>

          <div className="flex gap-3 items-center">
            {session?.user ? (
              <>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${primaryButtonClass}`}
                >
                  <Plus className="h-4 w-4" /> Add Blog
                </button>
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className={themeToggleClass}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Moon /> : <Sun />}
                </button>
                {session.user.email ? (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                      className={`h-10 w-10 rounded-full overflow-hidden border inline-flex items-center justify-center transition ${
                        isDark
                          ? "border-neutral-600 hover:border-neutral-400"
                          : "border-neutral-300 hover:border-neutral-500"
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
                        className={`absolute right-0 mt-2 w-40 rounded-lg border shadow-lg overflow-hidden z-50 ${
                          isDark
                            ? "bg-neutral-900 border-neutral-700"
                            : "bg-white border-neutral-200"
                        }`}
                        role="menu"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`block px-4 py-2 text-sm transition ${
                            isDark
                              ? "text-neutral-300 hover:text-white hover:bg-white/10"
                              : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
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
                              ? "text-neutral-300 hover:text-white hover:bg-white/10"
                              : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                          }`}
                          role="menuitem"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => signOut()}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      isDark
                        ? "text-neutral-300 hover:text-white hover:bg-white/10"
                        : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    Sign Out
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className={themeToggleClass}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Moon /> : <Sun />}
                </button>
                <button
                  onClick={() => signIn("google")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${primaryButtonClass}`}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Featured Post */}
      {featuredPost && (
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
            <div
              className={`grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center rounded-3xl p-8 shadow-sm border ${
                isDark
                  ? "bg-neutral-900/70 border-neutral-700"
                  : "bg-white/80 border-neutral-200"
              } backdrop-blur`}
            >
              <div>
                <div
                  className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                    isDark
                      ? "text-neutral-900 bg-neutral-300"
                      : "text-neutral-600 bg-neutral-100"
                  }`}
                >
                  Weekly Digest
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold mt-4 leading-tight">
                  {featuredPost.title}
                </h1>
                <p
                  className={`mt-4 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}
                >
                  {featuredPost.excerpt}
                </p>
                <div
                  className={`mt-6 flex flex-wrap items-center gap-4 text-sm ${
                    isDark ? "text-neutral-300" : "text-neutral-500"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {featuredPost.authorEmail ? (
                      <Link
                        href={`/profile/${encodeURIComponent(
                          featuredPost.authorEmail,
                        )}`}
                        className={
                          isDark ? "hover:text-white" : "hover:text-neutral-900"
                        }
                      >
                        {featuredPost.author}
                      </Link>
                    ) : (
                      <span>{featuredPost.author}</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> {featuredPost.readTime}
                  </span>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setSelectedPost(featuredPost)}
                    className={`inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition ${primaryButtonClass}`}
                  >
                    Read the feature
                  </button>
                  <button
                    className={`inline-flex items-center rounded-xl border px-6 py-3 text-sm font-semibold transition ${
                      isDark
                        ? "border-neutral-700 bg-neutral-900/50 text-neutral-300 hover:border-neutral-500 hover:bg-white/10"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    Browse the archive
                  </button>
                </div>
              </div>
              <div
                className={`rounded-2xl overflow-hidden shadow-sm border ${
                  isDark
                    ? "bg-neutral-700 border-neutral-700"
                    : "bg-neutral-100 border-neutral-200"
                }`}
              >
                <GradientCover
                  title={featuredPost.title}
                  category={featuredPost.category}
                  readTime={featuredPost.readTime}
                  imageToken={featuredPost.image}
                  isDark={isDark}
                  className="aspect-[16/10]"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${
                isDark ? "text-neutral-300" : "text-neutral-500"
              }`}
            >
              Latest Stories
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold mt-2">
              Insights from the builders&apos; desk
            </h2>
            <p
              className={`mt-2 max-w-2xl ${
                isDark ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              Curated perspectives on development, product thinking, and the
              future of technology.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition border ${
                    isActive
                      ? "border-neutral-400 bg-neutral-300 text-neutral-950 shadow-sm"
                      : isDark
                        ? "bg-neutral-900/70 text-neutral-300 border-neutral-700 hover:border-neutral-600 hover:text-white"
                        : "bg-white/80 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className={isDark ? "text-neutral-300" : "text-neutral-500"}>
              Loading...
            </p>
          ) : filteredPosts.length === 0 ? (
            <p className={isDark ? "text-neutral-300" : "text-neutral-500"}>
              No blogs available.
            </p>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post._id}
                onClick={() => setSelectedPost(post)}
                className={`group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 cursor-pointer border hover:-translate-y-1 ${
                  isDark
                    ? "bg-neutral-900/70 border-neutral-700"
                    : "bg-white border-neutral-200"
                }`}
              >
                <GradientCover
                  title={post.title}
                  category={post.category}
                  readTime={post.readTime}
                  imageToken={post.image}
                  isDark={isDark}
                  compact
                />
                <div className="p-6">
                  <span
                    className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                      isDark
                        ? "text-neutral-900 bg-neutral-300"
                        : "text-neutral-500 bg-neutral-100"
                    }`}
                  >
                    {post.category}
                  </span>
                  <h2 className="text-lg font-semibold mt-3">{post.title}</h2>
                  <p
                    className={`mt-2 line-clamp-3 ${
                      isDark ? "text-neutral-300" : "text-neutral-600"
                    }`}
                  >
                    {post.excerpt}
                  </p>
                  <div
                    className={`flex items-center gap-4 text-xs mt-4 ${
                      isDark ? "text-neutral-300" : "text-neutral-500"
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

      {/* Add Blog Modal */}
      {isAddModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
            isDark ? "bg-neutral-950/75" : "bg-neutral-900/40"
          }`}
        >
          <div
            className={`w-full max-w-2xl rounded-3xl p-[1px] shadow-2xl ${
              isDark
                ? "bg-gradient-to-br from-neutral-500 via-neutral-700 to-neutral-900"
                : "bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-400"
            }`}
          >
            <div
              className={`max-h-[90vh] overflow-y-auto rounded-3xl border p-6 md:p-7 ${
                isDark
                  ? "border-neutral-700 bg-neutral-900/95 text-neutral-100"
                  : "border-neutral-200 bg-white/95 text-neutral-900"
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    Editor Workspace
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Create a new blog
                  </h2>
                  <p
                    className={`mt-1 text-sm ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    Give your post a title, strong excerpt, and polished cover.
                  </p>
                </div>
                <button
                  type="button"
                  className={`h-9 w-9 rounded-full border text-sm font-semibold transition ${
                    isDark
                      ? "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
                      : "border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                  onClick={() => setIsAddModalOpen(false)}
                  aria-label="Close add blog modal"
                >
                  X
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className={modalLabelClass} htmlFor="blog-title">
                    Title *
                  </label>
                  <input
                    id="blog-title"
                    type="text"
                    placeholder="A concise title your readers will remember"
                    className={modalInputClass}
                    value={newBlog.title || ""}
                    onChange={(e) =>
                      setNewBlog((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className={modalLabelClass} htmlFor="blog-excerpt">
                    Excerpt *
                  </label>
                  <input
                    id="blog-excerpt"
                    type="text"
                    placeholder="One or two lines that hook the reader"
                    className={modalInputClass}
                    value={newBlog.excerpt || ""}
                    onChange={(e) =>
                      setNewBlog((p) => ({ ...p, excerpt: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className={modalLabelClass} htmlFor="blog-image">
                    Cover gradient
                  </label>
                  <p className={`text-xs ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
                    Pick a gradient mood for your post cover.
                  </p>
                  <select
                    id="blog-image"
                    className={modalInputClass}
                    value={newBlog.image || "auto"}
                    onChange={(e) =>
                      setNewBlog((p) => ({ ...p, image: e.target.value }))
                    }
                  >
                    {coverStyleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div
                    className={`overflow-hidden rounded-2xl border ${
                      isDark
                        ? "border-neutral-800 bg-neutral-950/60"
                        : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <GradientCover
                      title={newBlog.title || "Your title appears here"}
                      category={newBlog.category || "Preview"}
                      readTime={newBlog.readTime || "5 min read"}
                      imageToken={newBlog.image || "auto"}
                      isDark={isDark}
                      className="h-44 w-full"
                      compact
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={modalLabelClass} htmlFor="blog-category">
                    Category *
                  </label>
                  <select
                    id="blog-category"
                    className={modalInputClass}
                    value={newBlog.category || ""}
                    onChange={(e) =>
                      setNewBlog((p) => ({ ...p, category: e.target.value }))
                    }
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                  </select>
                </div>

                <div
                  className={`rounded-2xl border p-3 ${
                    isDark
                      ? "border-neutral-700 bg-neutral-950/50"
                      : "border-neutral-200 bg-neutral-50/80"
                  }`}
                >
                  <p className={modalLabelClass}>Content *</p>
                  <div className="mt-2">
                    <CustomEditor
                      value={frozenInitialContent}
                      onChange={handleEditorChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-end gap-3">
                <button
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    isDark
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={`rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition ${primaryButtonClass}`}
                  onClick={handleAddBlog}
                >
                  Publish Blog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`py-8 mt-auto ${
          isDark
            ? "bg-neutral-900 text-neutral-300"
            : "bg-neutral-900 text-white"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 text-sm ${
            isDark ? "text-neutral-300" : "text-neutral-300"
          }`}
        >
          (c) 2025 TechBlog. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BlogApp;
