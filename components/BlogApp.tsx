"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  BookOpen,
  User,
  ArrowLeft,
  Clock,
  Calendar,
  Plus,
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

type BlogSortKey =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "read-short"
  | "read-long";

const AUTO_COVER_GRADIENTS = [
  "from-zinc-500 via-neutral-700 to-zinc-950",
  "from-stone-500 via-neutral-700 to-stone-950",
  "from-neutral-500 via-gray-700 to-zinc-950",
  "from-gray-500 via-neutral-700 to-neutral-950",
  "from-neutral-600 via-stone-700 to-neutral-950",
  "from-stone-600 via-gray-700 to-zinc-950",
];

const COVER_STYLE_GRADIENTS: Record<string, string> = {
  sunset: "from-stone-500 via-neutral-700 to-zinc-950",
  ocean: "from-neutral-500 via-gray-700 to-zinc-950",
  forest: "from-stone-600 via-neutral-700 to-neutral-950",
  dusk: "from-gray-600 via-neutral-800 to-zinc-950",
  bloom: "from-neutral-500 via-gray-700 to-zinc-950",
};

const coverStyleOptions = [
  { label: "Auto blend", value: "auto" },
  { label: "Stone haze", value: "sunset" },
  { label: "Slate fog", value: "ocean" },
  { label: "Ash mist", value: "forest" },
  { label: "Carbon dusk", value: "dusk" },
  { label: "Silver smoke", value: "bloom" },
];

const sortOptions: Array<{ label: string; value: BlogSortKey }> = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Title A-Z", value: "title-asc" },
  { label: "Title Z-A", value: "title-desc" },
  { label: "Read time: short", value: "read-short" },
  { label: "Read time: long", value: "read-long" },
];

const BLOG_DRAFT_STORAGE_KEY = "techblog:new-blog-draft:v1";

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

const extractErrorMessage = (payload: unknown, fallback: string): string => {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return fallback;
};

const hasBlogDraftContent = (draft: unknown): boolean => {
  if (!draft || typeof draft !== "object") {
    return false;
  }

  const parsedDraft = draft as Partial<BlogPost>;
  const fields = [
    parsedDraft.title,
    parsedDraft.excerpt,
    parsedDraft.category,
    parsedDraft.image,
    parsedDraft.readTime,
    parsedDraft.content,
  ];

  return fields.some(
    (field) => typeof field === "string" && field.trim().length > 0,
  );
};

const getPostTimestamp = (dateValue: string): number => {
  const timestamp = new Date(dateValue).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getReadMinutes = (readTimeValue: string): number => {
  const match = readTimeValue.match(/\d+/);
  const minutes = match ? Number.parseInt(match[0], 10) : 0;
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 1;
};

const estimateReadTime = (content: string): string => {
  const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!plainText) return "1 min read";

  const words = plainText.split(" ").length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
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
      <div className={`absolute inset-0 ${isDark ? "bg-black/36" : "bg-black/24"}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(255,255,255,0.2),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_84%,rgba(0,0,0,0.62),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(125deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_42%,rgba(0,0,0,0.34)_100%)]" />

      <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
        <span className="inline-flex w-fit items-center rounded-full border border-white/35 bg-black/32 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/95 backdrop-blur">
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<BlogSortKey>("newest");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const [frozenInitialContent, setFrozenInitialContent] = useState("");
  const [editorInstanceKey, setEditorInstanceKey] = useState(0);
  const [newBlog, setNewBlog] = useState<Partial<BlogPost>>({});

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const blogGridRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
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

  // Fetch Blogs
  useEffect(() => {
    const controller = new AbortController();

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/blogs", { signal: controller.signal });
        const data = await res.json();

        if (!res.ok || !data.success) {
          toast.error(extractErrorMessage(data, "Could not load blogs."));
          return;
        }

        setBlogPosts(data.posts);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Error loading blogs:", err);
        toast.error("Could not load blogs. Please refresh and try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      controller.abort();
    };
  }, []);

  // Editor change handler (does NOT push value back to editor)
  const handleEditorChange = useCallback((content: string) => {
    setNewBlog((prev) => ({ ...prev, content }));
  }, []);

  useEffect(() => {
    if (!isAddModalOpen || typeof window === "undefined") return;

    const draftSnapshot: Partial<BlogPost> = {
      title: newBlog.title || "",
      excerpt: newBlog.excerpt || "",
      category: newBlog.category || "",
      image: newBlog.image || "",
      readTime: newBlog.readTime || "",
      content: newBlog.content || "",
    };

    if (!hasBlogDraftContent(draftSnapshot)) {
      window.localStorage.removeItem(BLOG_DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      BLOG_DRAFT_STORAGE_KEY,
      JSON.stringify(draftSnapshot),
    );
  }, [isAddModalOpen, newBlog]);

  const handleOpenAddModal = useCallback(() => {
    const currentDraftExists = hasBlogDraftContent(newBlog);
    if (currentDraftExists) {
      setFrozenInitialContent(newBlog.content || "");
      setIsAddModalOpen(true);
      return;
    }

    if (typeof window === "undefined") {
      setFrozenInitialContent("");
      setIsAddModalOpen(true);
      return;
    }

    try {
      const storedDraft = window.localStorage.getItem(BLOG_DRAFT_STORAGE_KEY);
      if (!storedDraft) {
        setFrozenInitialContent("");
        setIsAddModalOpen(true);
        return;
      }

      const parsedDraft: Partial<BlogPost> = JSON.parse(storedDraft);
      if (!hasBlogDraftContent(parsedDraft)) {
        window.localStorage.removeItem(BLOG_DRAFT_STORAGE_KEY);
        setFrozenInitialContent("");
        setIsAddModalOpen(true);
        return;
      }

      setNewBlog(parsedDraft);
      setFrozenInitialContent(parsedDraft.content || "");
      toast("Loaded your saved draft.");
    } catch (error) {
      console.error("Error restoring draft:", error);
      window.localStorage.removeItem(BLOG_DRAFT_STORAGE_KEY);
      setFrozenInitialContent("");
    } finally {
      setIsAddModalOpen(true);
    }
  }, [newBlog]);

  const handleClearDraft = useCallback(() => {
    setNewBlog({});
    setFrozenInitialContent("");
    setEditorInstanceKey((prev) => prev + 1);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(BLOG_DRAFT_STORAGE_KEY);
    }

    toast.success("Draft cleared.");
  }, []);

  const categories: string[] = ["All", "Development", "Design", "Technology"];

  const estimatedReadTime = useMemo(
    () => estimateReadTime(newBlog.content || ""),
    [newBlog.content],
  );

  const visiblePosts = useMemo(() => {
    const categoryFiltered =
      selectedCategory === "All"
        ? blogPosts
        : blogPosts.filter((post) => post.category === selectedCategory);

    const mineFiltered =
      showOnlyMine && session?.user?.email
        ? categoryFiltered.filter((post) => post.authorEmail === session.user.email)
        : categoryFiltered;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const queryFiltered = normalizedQuery
      ? mineFiltered.filter((post) =>
          [
            post.title,
            post.excerpt,
            post.author,
            post.category,
            post.readTime,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : mineFiltered;

    const sorted = [...queryFiltered];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => getPostTimestamp(a.date) - getPostTimestamp(b.date));
        break;
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "read-short":
        sorted.sort((a, b) => getReadMinutes(a.readTime) - getReadMinutes(b.readTime));
        break;
      case "read-long":
        sorted.sort((a, b) => getReadMinutes(b.readTime) - getReadMinutes(a.readTime));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => getPostTimestamp(b.date) - getPostTimestamp(a.date));
    }

    return sorted;
  }, [
    blogPosts,
    searchQuery,
    selectedCategory,
    session?.user?.email,
    showOnlyMine,
    sortBy,
  ]);

  const hasActiveArchiveFilters =
    selectedCategory !== "All" || searchQuery.trim().length > 0 || showOnlyMine;
  const hasDraftContent = hasBlogDraftContent(newBlog);

  const featuredPost = blogPosts[0];
  const modalInputClass = `w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
    isDark
      ? "border-neutral-700 bg-neutral-950/70 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500/40"
      : "border-stone-300 bg-white/90 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-200"
  }`;
  const modalLabelClass = `text-xs font-semibold uppercase tracking-wide ${
    isDark ? "text-neutral-400" : "text-stone-600"
  }`;
  const primaryButtonClass = isDark
    ? "bg-neutral-300 text-neutral-950 hover:bg-neutral-200"
    : "bg-amber-300 text-amber-950 hover:bg-amber-200 shadow-[0_10px_24px_rgba(217,119,6,0.24)]";
  const filterControlClass = `rounded-xl border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 ${
    isDark
      ? "border-neutral-700 bg-neutral-900/70 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500/40"
      : "border-stone-300 bg-white/90 text-stone-900 placeholder:text-stone-500 focus:border-amber-400 focus:ring-amber-200"
  }`;

  // Add Blog
  const handleAddBlog = useCallback(async () => {
    if (isPublishing) return;

    const trimmedTitle = newBlog.title?.trim();
    const trimmedExcerpt = newBlog.excerpt?.trim();
    const trimmedCategory = newBlog.category?.trim();
    const trimmedContent = newBlog.content?.trim();

    if (!trimmedTitle || !trimmedExcerpt || !trimmedCategory || !trimmedContent) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const blogData = {
      ...newBlog,
      title: trimmedTitle,
      excerpt: trimmedExcerpt,
      category: trimmedCategory,
      content: trimmedContent,
      image: newBlog.image?.trim() || "auto",
      readTime: newBlog.readTime?.trim() || estimateReadTime(trimmedContent),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      author: session?.user?.name || "Unknown Author",
    };

    setIsPublishing(true);

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(blogData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(extractErrorMessage(data, "Failed to add blog."));
        return;
      }

      setBlogPosts((prev) => [data.post, ...prev]);
      setIsAddModalOpen(false);
      setNewBlog({});
      setFrozenInitialContent("");
      setEditorInstanceKey((prev) => prev + 1);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(BLOG_DRAFT_STORAGE_KEY);
      }

      toast.success("Blog published.");
    } catch (err) {
      console.error("Error adding blog:", err);
      toast.error("Error creating blog.");
    } finally {
      setIsPublishing(false);
    }
  }, [isPublishing, newBlog, session?.user?.name]);

  // Delete Blog
  const handleDeleteBlog = useCallback(async (id?: string) => {
    if (!id || deletingPostId) return;
    if (!window.confirm("Delete this blog?")) return;

    setDeletingPostId(id);

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(extractErrorMessage(data, "Could not delete blog."));
        return;
      }

      setBlogPosts((prev) => prev.filter((p) => p._id !== id));
      setSelectedPost(null);
      toast.success("Blog deleted.");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Could not delete blog.");
    } finally {
      setDeletingPostId(null);
    }
  }, [deletingPostId]);

  const scrollToArchive = useCallback(() => {
    blogGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const clearArchiveFilters = useCallback(() => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSortBy("newest");
    setShowOnlyMine(false);
  }, []);

  const handlePostCardKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>, post: BlogPost) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setSelectedPost(post);
      }
    },
    [],
  );

  // Single Post View
  if (selectedPost) {
    return (
      <div
        className={
          isDark
            ? "min-h-screen font-sans bg-neutral-950 text-neutral-200 bg-[radial-gradient(920px_circle_at_12%_-10%,rgba(163,163,163,0.08),transparent_56%),radial-gradient(780px_circle_at_96%_0%,rgba(38,38,38,0.4),transparent_52%),linear-gradient(180deg,#070707_0%,#101010_100%)]"
            : "min-h-screen font-sans bg-[#fdfaf4] text-stone-900 bg-[radial-gradient(980px_circle_at_8%_-16%,rgba(251,191,36,0.18),transparent_52%),radial-gradient(900px_circle_at_94%_0%,rgba(14,165,233,0.14),transparent_48%),linear-gradient(180deg,#fffdf8_0%,#f6ecdd_100%)]"
        }
      >
        <nav
          className={`sticky top-0 z-50 border-b ${
            isDark
              ? "bg-neutral-900/80 border-neutral-700"
              : "bg-[#fff9f1]/90 border-amber-100/80"
          } backdrop-blur`}
        >
          <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  isDark
                    ? "bg-neutral-300 text-neutral-900"
                    : "bg-gradient-to-br from-amber-300 to-orange-400 text-amber-950 shadow-sm"
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
                onClick={() => setSelectedPost(null)}
                className={`text-sm font-medium ${
                  isDark
                    ? "text-neutral-300 hover:text-white"
                    : "text-stone-600 hover:text-stone-900"
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
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </button>

          <div
            className={`rounded-2xl overflow-hidden shadow-sm border ${
              isDark
                ? "bg-neutral-900/70 border-neutral-700"
                : "bg-white/85 border-amber-100 shadow-[0_20px_48px_rgba(217,119,6,0.12)]"
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
                    : "text-amber-900 bg-amber-100/80"
                }`}
              >
                {selectedPost.category}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold mt-4">
                {selectedPost.title}
              </h1>

              <div
                className={`flex flex-wrap items-center gap-4 text-sm mt-4 ${
                  isDark ? "text-neutral-300" : "text-stone-600"
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
                        isDark ? "hover:text-white" : "hover:text-amber-900"
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
                  type="button"
                  onClick={() => handleDeleteBlog(selectedPost._id)}
                  disabled={deletingPostId === selectedPost._id}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingPostId === selectedPost._id ? "Deleting..." : "Delete post"}
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
          ? "min-h-screen font-sans bg-neutral-950 text-neutral-200 flex flex-col bg-[radial-gradient(980px_circle_at_12%_-12%,rgba(163,163,163,0.08),transparent_58%),radial-gradient(820px_circle_at_96%_0%,rgba(38,38,38,0.4),transparent_52%),linear-gradient(180deg,#070707_0%,#101010_100%)]"
          : "min-h-screen font-sans bg-[#fcf8f1] text-stone-900 flex flex-col bg-[radial-gradient(1180px_circle_at_14%_-8%,rgba(251,191,36,0.2),transparent_52%),radial-gradient(980px_circle_at_88%_-14%,rgba(56,189,248,0.14),transparent_48%),linear-gradient(180deg,#fffdf8_0%,#f5ecdf_100%)]"
      }
    >
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 border-b ${
          isDark
            ? "bg-neutral-900/80 border-neutral-700"
            : "bg-[#fff9f1]/90 border-amber-100/80"
        } backdrop-blur`}
      >
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                isDark
                  ? "bg-neutral-300 text-neutral-900"
                  : "bg-gradient-to-br from-amber-300 to-orange-400 text-amber-950 shadow-sm"
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
                  type="button"
                  onClick={handleOpenAddModal}
                  disabled={isPublishing}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${primaryButtonClass}`}
                >
                  <Plus className="h-4 w-4" /> Add Blog
                </button>
                {session.user.email ? (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                      className={`h-10 w-10 rounded-full overflow-hidden border inline-flex items-center justify-center transition ${
                        isDark
                          ? "border-neutral-600 hover:border-neutral-400"
                          : "border-amber-200 hover:border-amber-400"
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
                            : "bg-[#fffdf8] border-amber-100"
                        }`}
                        role="menu"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`block px-4 py-2 text-sm transition ${
                            isDark
                              ? "text-neutral-300 hover:text-white hover:bg-white/10"
                              : "text-stone-700 hover:text-stone-900 hover:bg-amber-100/60"
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
                              : "text-stone-700 hover:text-stone-900 hover:bg-amber-100/60"
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
                        : "text-stone-700 hover:text-stone-900 hover:bg-amber-100/60"
                    }`}
                  >
                    Sign Out
                  </button>
                )}
              </>
            ) : (
              <>
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
                  : "bg-white/75 border-amber-100 shadow-[0_24px_56px_rgba(217,119,6,0.1)]"
              } backdrop-blur`}
            >
              <div>
                <div
                  className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                    isDark
                      ? "text-neutral-900 bg-neutral-300"
                      : "text-amber-900 bg-amber-100/80"
                  }`}
                >
                  Weekly Digest
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold mt-4 leading-tight">
                  {featuredPost.title}
                </h1>
                <p
                  className={`mt-4 ${isDark ? "text-neutral-300" : "text-stone-600"}`}
                >
                  {featuredPost.excerpt}
                </p>
                <div
                  className={`mt-6 flex flex-wrap items-center gap-4 text-sm ${
                    isDark ? "text-neutral-300" : "text-stone-600"
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
                          isDark ? "hover:text-white" : "hover:text-amber-900"
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
                    type="button"
                    onClick={() => setSelectedPost(featuredPost)}
                    className={`inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition ${primaryButtonClass}`}
                  >
                    Read the feature
                  </button>
                  <button
                    type="button"
                    onClick={scrollToArchive}
                    className={`inline-flex items-center rounded-xl border px-6 py-3 text-sm font-semibold transition ${
                      isDark
                        ? "border-neutral-700 bg-neutral-900/50 text-neutral-300 hover:border-neutral-500 hover:bg-white/10"
                        : "border-amber-200 text-amber-900 hover:border-amber-300 hover:bg-amber-100/70"
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
                    : "bg-amber-50/50 border-amber-100"
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
      <section ref={blogGridRef} className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-8 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-widest ${
                  isDark ? "text-neutral-300" : "text-amber-700"
                }`}
              >
                Latest Stories
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold mt-2">
                Insights from the builders&apos; desk
              </h2>
              <p
                className={`mt-2 max-w-2xl ${
                  isDark ? "text-neutral-300" : "text-stone-600"
                }`}
              >
                Curated perspectives on development, product thinking, and the
                future of technology.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[minmax(220px,1fr)_190px_auto]">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, excerpt, author..."
                className={filterControlClass}
                aria-label="Search posts"
              />

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as BlogSortKey)}
                className={filterControlClass}
                aria-label="Sort posts"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {session?.user?.email ? (
                <button
                  type="button"
                  onClick={() => setShowOnlyMine((prev) => !prev)}
                  aria-pressed={showOnlyMine}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    showOnlyMine
                      ? isDark
                        ? "border-neutral-400 bg-neutral-300 text-neutral-950"
                        : "border-amber-300 bg-amber-200 text-amber-950"
                      : isDark
                        ? "border-neutral-700 bg-neutral-900/70 text-neutral-300 hover:border-neutral-500 hover:text-white"
                        : "border-amber-200 bg-white/90 text-stone-700 hover:border-amber-300 hover:bg-amber-100/60 hover:text-stone-900"
                  }`}
                >
                  {showOnlyMine ? "Showing my posts" : "Show my posts"}
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={isActive}
                    className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition border ${
                      isActive
                        ? isDark
                          ? "border-neutral-400 bg-neutral-300 text-neutral-950 shadow-sm"
                          : "border-amber-300 bg-amber-200 text-amber-950 shadow-sm"
                        : isDark
                          ? "bg-neutral-900/70 text-neutral-300 border-neutral-700 hover:border-neutral-600 hover:text-white"
                          : "bg-white/80 text-stone-600 border-amber-100 hover:border-amber-300 hover:text-stone-900"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div
              className={`flex items-center gap-3 text-xs font-medium ${
                isDark ? "text-neutral-400" : "text-stone-600"
              }`}
            >
              <span>
                Showing {visiblePosts.length} of {blogPosts.length} posts
              </span>
              {hasActiveArchiveFilters && (
                <button
                  type="button"
                  onClick={clearArchiveFilters}
                  className={`rounded-full border px-3 py-1 transition ${
                    isDark
                      ? "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                      : "border-amber-200 text-stone-700 hover:border-amber-300 hover:text-stone-900"
                  }`}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className={isDark ? "text-neutral-300" : "text-stone-500"}>
              Loading...
            </p>
          ) : visiblePosts.length === 0 ? (
            <p className={isDark ? "text-neutral-300" : "text-stone-500"}>
              No posts match your current filters.
            </p>
          ) : (
            visiblePosts.map((post) => (
              <article
                key={post._id}
                onClick={() => setSelectedPost(post)}
                onKeyDown={(event) => handlePostCardKeyDown(event, post)}
                role="button"
                tabIndex={0}
                aria-label={`Open post: ${post.title}`}
                className={`group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 cursor-pointer border hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/60 ${
                  isDark
                    ? "bg-neutral-900/70 border-neutral-700"
                    : "bg-white/85 border-amber-100 shadow-[0_16px_30px_rgba(217,119,6,0.1)]"
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
                        : "text-amber-900 bg-amber-100/80"
                    }`}
                  >
                    {post.category}
                  </span>
                  <h2 className="text-lg font-semibold mt-3">{post.title}</h2>
                  <p
                    className={`mt-2 line-clamp-3 ${
                      isDark ? "text-neutral-300" : "text-stone-600"
                    }`}
                  >
                    {post.excerpt}
                  </p>
                  <div
                    className={`flex items-center gap-4 text-xs mt-4 ${
                      isDark ? "text-neutral-300" : "text-stone-500"
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
            isDark ? "bg-neutral-950/75" : "bg-amber-950/20"
          }`}
        >
          <div
            className={`w-full max-w-2xl rounded-3xl p-[1px] shadow-2xl ${
              isDark
                ? "bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-950"
                : "bg-gradient-to-br from-amber-200 via-orange-300 to-cyan-300"
            }`}
          >
            <div
              className={`max-h-[90vh] overflow-y-auto rounded-3xl border p-6 md:p-7 ${
                isDark
                  ? "border-neutral-700 bg-neutral-900/95 text-neutral-100"
                  : "border-amber-100 bg-[#fffaf3]/95 text-stone-900"
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      isDark ? "text-neutral-400" : "text-amber-700"
                    }`}
                  >
                    Editor Workspace
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Create a new blog
                  </h2>
                  <p
                    className={`mt-1 text-sm ${
                      isDark ? "text-neutral-400" : "text-stone-600"
                    }`}
                  >
                    Give your post a title, strong excerpt, and polished cover.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasDraftContent && (
                    <button
                      type="button"
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        isDark
                          ? "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                          : "border-amber-200 text-stone-700 hover:border-amber-300 hover:text-stone-900"
                      }`}
                      disabled={isPublishing}
                      onClick={handleClearDraft}
                    >
                      Clear draft
                    </button>
                  )}
                  <button
                    type="button"
                    className={`h-9 w-9 rounded-full border text-sm font-semibold transition ${
                      isDark
                        ? "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
                        : "border-amber-200 text-stone-600 hover:border-amber-300 hover:bg-amber-100/70 hover:text-stone-900"
                    }`}
                    disabled={isPublishing}
                    onClick={() => setIsAddModalOpen(false)}
                    aria-label="Close add blog modal"
                  >
                    X
                  </button>
                </div>
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
                  <p className={`text-xs ${isDark ? "text-neutral-500" : "text-stone-500"}`}>
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
                        : "border-amber-100 bg-amber-50/50"
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
                      : "border-amber-100 bg-amber-50/40"
                  }`}
                >
                  <p className={modalLabelClass}>Content *</p>
                  <div className="mt-2">
                    <CustomEditor
                      key={editorInstanceKey}
                      value={frozenInitialContent}
                      onChange={handleEditorChange}
                    />
                  </div>
                  <p
                    className={`mt-3 text-xs ${
                      isDark ? "text-neutral-400" : "text-stone-600"
                    }`}
                  >
                    Estimated read time: {estimatedReadTime}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                {hasDraftContent ? (
                  <button
                    type="button"
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      isDark
                        ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        : "border-amber-200 text-stone-700 hover:bg-amber-100/70 hover:text-stone-900"
                    }`}
                    disabled={isPublishing}
                    onClick={handleClearDraft}
                  >
                    Start fresh
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      isDark
                        ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        : "border-amber-200 text-stone-700 hover:bg-amber-100/70 hover:text-stone-900"
                    }`}
                    disabled={isPublishing}
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition ${primaryButtonClass}`}
                    disabled={isPublishing}
                    onClick={handleAddBlog}
                  >
                    {isPublishing ? "Publishing..." : "Publish Blog"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`py-8 mt-auto ${
          isDark
            ? "bg-neutral-900 text-neutral-300"
            : "bg-[#f4e8d5] text-stone-700 border-t border-amber-100"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 text-sm ${
            isDark ? "text-neutral-300" : "text-stone-600"
          }`}
        >
          (c) 2025 TechBlog. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BlogApp;
