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
import BlogBox from "./BlogBox";
import CustomEditor from "./CustomEditor";

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

const BlogApp: React.FC = () => {
  const { data: session } = useSession();

  const [selectedCategory] = useState<string>("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const [newBlog, setNewBlog] = useState<Partial<BlogPost>>({});
  const [frozenInitialContent, setFrozenInitialContent] = useState(""); // ⭐ Fix cursor jump

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Freeze TinyMCE initial content only when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      setFrozenInitialContent(newBlog.content || "");
    }
  }, [isAddModalOpen]);

  // Fetch blogs
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
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

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
      <div className="min-h-screen bg-neutral-50">
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold">TechBlog</span>
            </div>
            <button onClick={() => setSelectedPost(null)}>Back</button>
          </div>
        </nav>

        <article className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center text-indigo-600 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Articles
          </button>

          <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>

          <div className="flex items-center gap-4 text-neutral-600 mb-6">
            <span className="flex items-center">
              <User className="h-5 w-5 mr-2" /> {selectedPost.author}
            </span>
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" /> {selectedPost.date}
            </span>
            <span className="flex items-center">
              <Clock className="h-5 w-5 mr-2" /> {selectedPost.readTime}
            </span>
          </div>

          <div
            className="prose max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
          ></div>

          <button
            onClick={() => handleDeleteBlog(selectedPost._id)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </article>
      </div>
    );
  }

  // Home Page UI
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center px-4">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-2xl font-bold">TechBlog</span>
          </div>

          <div className="flex gap-4">
            {session?.user ? (
              <>
                <button
                  onClick={() => signOut()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Blog
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Featured */}
      {featuredPost && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">{featuredPost.title}</h1>
            <p className="text-indigo-200 mb-6">{featuredPost.excerpt}</p>
            <button
              onClick={() => setSelectedPost(featuredPost)}
              className="bg-white text-indigo-600 px-6 py-3 rounded"
            >
              Read More
            </button>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p>Loading...</p>
        ) : filteredPosts.length === 0 ? (
          <p>No blogs available.</p>
        ) : (
          filteredPosts.map((post) => (
            <article
              key={post._id}
              onClick={() => setSelectedPost(post)}
              className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg transition"
            >
              <span className="text-sm bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                {post.category}
              </span>
              <h2 className="text-xl font-bold mt-2">{post.title}</h2>
              <p className="text-neutral-600">{post.excerpt}</p>
            </article>
          ))
        )}
      </div>

      {/* Add Blog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-5">Add New Blog</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full border p-3 rounded"
                value={newBlog.title || ""}
                onChange={(e) =>
                  setNewBlog((p) => ({ ...p, title: e.target.value }))
                }
              />

              <input
                type="text"
                placeholder="Excerpt"
                className="w-full border p-3 rounded"
                value={newBlog.excerpt || ""}
                onChange={(e) =>
                  setNewBlog((p) => ({ ...p, excerpt: e.target.value }))
                }
              />

              <select
                className="w-full border p-3 rounded"
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

              <CustomEditor
                value={newBlog.content || ""}
                onChange={(html) =>
                  setNewBlog((prev) => ({ ...prev, content: html }))
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded"
                onClick={handleAddBlog}
              >
                Add Blog
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-neutral-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          © 2025 TechBlog. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BlogApp;
