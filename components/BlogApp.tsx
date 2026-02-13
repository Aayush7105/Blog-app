"use client";

import React, { useState, useEffect, useCallback } from "react";
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

const BlogApp: React.FC = () => {
  const { data: session } = useSession();

  const [theme, setTheme] = useState<ThemeMode>("light");
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

  const isDark = theme === "dark";

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
      image:
        newBlog.image ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=700&fit=crop",
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
            ? "min-h-screen bg-neutral-900 text-neutral-300"
            : "min-h-screen bg-slate-50 text-slate-900"
        }
      >
        <nav
          className={`sticky top-0 z-50 border-b ${
            isDark
              ? "bg-neutral-900/80 border-neutral-700"
              : "bg-white/80 border-slate-200"
          } backdrop-blur`}
        >
          <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
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
              <button
                onClick={() => setSelectedPost(null)}
                className={`text-sm font-medium ${
                  isDark
                    ? "text-neutral-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
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
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </button>

          <div
            className={`rounded-2xl overflow-hidden shadow-sm border ${
              isDark
                ? "bg-neutral-900/70 border-neutral-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`aspect-[16/9] ${
                isDark ? "bg-neutral-700" : "bg-slate-100"
              }`}
            >
              {selectedPost.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="p-8">
              <div
                className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                  isDark
                    ? "text-neutral-900 bg-neutral-300"
                    : "text-slate-500 bg-slate-100"
                }`}
              >
                {selectedPost.category}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold mt-4">
                {selectedPost.title}
              </h1>

              <div
                className={`flex flex-wrap items-center gap-4 text-sm mt-4 ${
                  isDark ? "text-neutral-300" : "text-slate-600"
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
                        isDark ? "hover:text-white" : "hover:text-slate-900"
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
          ? "min-h-screen bg-neutral-900 text-neutral-300 flex flex-col"
          : "min-h-screen bg-slate-50 text-slate-900 flex flex-col bg-[radial-gradient(1200px_circle_at_20%_-10%,#e2e8f0,transparent_55%),radial-gradient(900px_circle_at_80%_-15%,#e5e7eb,transparent_50%)]"
      }
    >
      {/* Navbar */}
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

          <div className="flex gap-3 items-center">
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

            {session?.user ? (
              <>
                {session.user.email && (
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
                  onClick={() => signOut()}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isDark
                      ? "text-neutral-300 hover:text-white hover:bg-white/10"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    isDark
                      ? "bg-neutral-300 text-neutral-900 hover:bg-neutral-200"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <Plus className="h-4 w-4" /> Add Blog
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isDark
                    ? "bg-neutral-300 text-neutral-900 hover:bg-neutral-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Sign in
              </button>
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
                  : "bg-white/80 border-slate-200"
              } backdrop-blur`}
            >
              <div>
                <div
                  className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                    isDark
                      ? "text-neutral-900 bg-neutral-300"
                      : "text-slate-600 bg-slate-100"
                  }`}
                >
                  Weekly Digest
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold mt-4 leading-tight">
                  {featuredPost.title}
                </h1>
                <p
                  className={`mt-4 ${isDark ? "text-neutral-300" : "text-slate-600"}`}
                >
                  {featuredPost.excerpt}
                </p>
                <div
                  className={`mt-6 flex flex-wrap items-center gap-4 text-sm ${
                    isDark ? "text-neutral-300" : "text-slate-500"
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
                          isDark ? "hover:text-white" : "hover:text-slate-900"
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
                    className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold transition ${
                      isDark
                        ? "bg-neutral-300 text-neutral-900 hover:bg-neutral-200"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    Read the feature
                  </button>
                  <button
                    className={`inline-flex items-center px-6 py-3 rounded-lg border text-sm font-semibold transition ${
                      isDark
                        ? "border-neutral-700 text-neutral-300 hover:bg-white/10"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
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
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                {featuredPost.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover aspect-[16/10]"
                  />
                )}
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
                isDark ? "text-neutral-300" : "text-slate-500"
              }`}
            >
              Latest Stories
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold mt-2">
              Insights from the builders' desk
            </h2>
            <p
              className={`mt-2 max-w-2xl ${
                isDark ? "text-neutral-300" : "text-slate-600"
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
                      ? isDark
                        ? "bg-neutral-300 text-neutral-900 border-neutral-300"
                        : "bg-slate-900 text-white border-slate-900"
                      : isDark
                        ? "bg-neutral-900/70 text-neutral-300 border-neutral-700 hover:border-neutral-600 hover:text-white"
                        : "bg-white/80 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
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
            <p className={isDark ? "text-neutral-300" : "text-slate-500"}>
              Loading...
            </p>
          ) : filteredPosts.length === 0 ? (
            <p className={isDark ? "text-neutral-300" : "text-slate-500"}>
              No blogs available.
            </p>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post._id}
                onClick={() => setSelectedPost(post)}
                className={`group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer border ${
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
                  <h2 className="text-lg font-semibold mt-3">{post.title}</h2>
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

      {/* Add Blog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-2xl w-full max-w-xl shadow-xl border ${
              isDark
                ? "bg-neutral-900 border-neutral-700 text-neutral-300"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Blog</h2>
              <button
                className={`text-sm ${
                  isDark
                    ? "text-neutral-300 hover:text-neutral-300"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setIsAddModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-neutral-900 border-neutral-700 text-neutral-300 focus:ring-neutral-300"
                    : "border-slate-200 focus:ring-slate-400"
                }`}
                value={newBlog.title || ""}
                onChange={(e) =>
                  setNewBlog((p) => ({ ...p, title: e.target.value }))
                }
              />

                <input
                  type="text"
                  placeholder="Excerpt"
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                    isDark
                    ? "bg-neutral-900 border-neutral-700 text-neutral-300 focus:ring-neutral-300"
                    : "border-slate-200 focus:ring-slate-400"
                }`}
                value={newBlog.excerpt || ""}
                onChange={(e) =>
                    setNewBlog((p) => ({ ...p, excerpt: e.target.value }))
                  }
                />

                <div className="space-y-2">
                  <div
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isDark ? "text-neutral-300" : "text-slate-600"
                    }`}
                  >
                    Cover image
                  </div>
                  <input
                    type="url"
                    placeholder="Paste image URL (optional)"
                    className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                      isDark
                        ? "bg-neutral-900 border-neutral-700 text-neutral-300 focus:ring-neutral-300"
                        : "border-slate-200 focus:ring-slate-400"
                    }`}
                    value={newBlog.image || ""}
                    onChange={(e) =>
                      setNewBlog((p) => ({ ...p, image: e.target.value }))
                    }
                  />
                  <div
                    className={`rounded-lg border overflow-hidden ${
                      isDark
                        ? "border-neutral-800 bg-neutral-900/70"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {newBlog.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={newBlog.image}
                        alt="Cover preview"
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`h-40 w-full flex items-center justify-center text-xs ${
                          isDark ? "text-neutral-400" : "text-slate-500"
                        }`}
                      >
                        Image preview appears here
                      </div>
                    )}
                  </div>
                </div>

                <select
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                    isDark
                    ? "bg-neutral-900 border-neutral-700 text-neutral-300 focus:ring-neutral-300"
                    : "border-slate-200 focus:ring-slate-400"
                }`}
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

              {/* Fixed editor */}
              <CustomEditor
                value={frozenInitialContent}
                onChange={handleEditorChange}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isDark
                    ? "text-neutral-300 hover:text-white hover:bg-white/10"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isDark
                    ? "bg-neutral-300 text-neutral-900 hover:bg-neutral-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
                onClick={handleAddBlog}
              >
                Add Blog
              </button>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`py-8 mt-auto ${
          isDark ? "bg-neutral-900 text-neutral-300" : "bg-slate-900 text-white"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 text-sm ${
            isDark ? "text-neutral-300" : "text-slate-300"
          }`}
        >
          (c) 2025 TechBlog. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BlogApp;
