"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  User,
  ArrowLeft,
  Clock,
  Calendar,
  ThumbsUp,
  Plus,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import { Editor } from "@tinymce/tinymce-react";

// Load SimpleMDE safely (no SSR)
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

// --- Interfaces ---
interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
  content: string;
}

// --- Main Component ---
const BlogApp: React.FC = () => {
  const { data: session } = useSession();
  const [selectedCategory] = useState<string>("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newBlog, setNewBlog] = useState<Partial<BlogPost>>({});
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // --- Fetch Blogs ---
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

  const categories: string[] = ["All", "Development", "Design", "Technology"];

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const featuredPost = blogPosts[0];

  // --- Add Blog ---
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
      } else {
        alert(`Failed to add blog: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding blog:", error);
      alert("An error occurred while adding your blog.");
    }
  }, [newBlog, session]);

  // --- Delete Blog ---
  const handleDeleteBlog = useCallback(async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setBlogPosts((prev) => prev.filter((p) => p._id !== id));
        setSelectedPost(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete blog.");
    }
  }, []);

  // --- Single Post View ---
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-neutral-50">
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
              <div className="text-black"> Sign in</div>
            </div>
          </div>
        </nav>

        {/* Post */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Articles
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {selectedPost.title}
          </h1>

          <div className="flex items-center gap-4 text-neutral-600 mb-6">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span>{selectedPost.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{selectedPost.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>{selectedPost.readTime}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8 whitespace-pre-wrap">
            {selectedPost.content}
          </div>

          <button
            onClick={() => handleDeleteBlog(selectedPost._id)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 ml-auto"
          >
            Delete
          </button>
        </article>
      </div>
    );
  }

  // --- Home Page ---
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-2xl font-bold text-neutral-900">
              TechBlog
            </span>
          </div>

          <div className="flex gap-5">
            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                Sign in
              </button>
            )}

            {session?.user && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" /> Add Blog
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Featured */}
      {featuredPost && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                Featured Post
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {featuredPost.title}
              </h1>
              <p className="text-lg mb-6 text-indigo-100">
                {featuredPost.excerpt}
              </p>
              <button
                onClick={() => setSelectedPost(featuredPost)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50"
              >
                Read More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p className="text-neutral-800">Loading blogs...</p>
        ) : filteredPosts.length === 0 ? (
          <p className="text-neutral-800">No blogs yet — add one!</p>
        ) : (
          filteredPosts.map((post) => (
            <article
              key={post._id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition"
            >
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full mb-3">
                {post.category}
              </span>
              <h2 className="text-xl font-bold text-neutral-900 mb-2 hover:text-indigo-600">
                {post.title}
              </h2>
              <p className="text-neutral-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.author}</span>
                </div>
                <span>{post.readTime}</span>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Add Blog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-5 text-neutral-900">
              Add New Blog
            </h2>

            <div className="space-y-4 text-black">
              <input
                type="text"
                placeholder="Title"
                className="w-full border border-neutral-300 p-3 rounded-lg"
                value={newBlog.title || ""}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, title: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Excerpt"
                className="w-full border border-neutral-300 p-3 rounded-lg"
                value={newBlog.excerpt || ""}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, excerpt: e.target.value })
                }
              />

              <select
                className="w-full border border-neutral-300 p-3 rounded-lg"
                value={newBlog.category || ""}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, category: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories
                  .filter((c) => c !== "All")
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>

              {/* SimpleMDE Markdown Editor */}
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                initialValue={newBlog.content || ""}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: ["lists", "link", "autolink", "preview"],
                  toolbar:
                    "undo redo | bold italic underline | bullist numlist | link | preview",
                }}
                onEditorChange={(content) =>
                  setNewBlog({ ...newBlog, content })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                onClick={handleAddBlog}
              >
                Add Blog
              </button>
            </div>
          </div>
        </div>
      )}

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
              <li>Home</li>
              <li>Articles</li>
              <li>About</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>Development</li>
              <li>Design</li>
              <li>Technology</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-neutral-400 mb-4">
              Subscribe for weekly updates.
            </p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <p className="text-sm">aayushrawat5107@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>© 2025 TechBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogApp;
