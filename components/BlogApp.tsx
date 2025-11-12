"use client";
import React, { useState } from "react";
import {
  Search,
  Menu,
  X,
  Home,
  BookOpen,
  User,
  Mail,
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Plus,
} from "lucide-react";

// --- Interfaces ---
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
  content: string;
}

interface Comment {
  id: number;
  postId: number;
  author: string;
  body: string;
  date: string;
}

// --- Main Component ---
const BlogApp: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newBlog, setNewBlog] = useState<Partial<BlogPost>>({});
  const [commentInput, setCommentInput] = useState<string>("");

  // Posts
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: "Getting Started with TypeScript in 2025",
      excerpt:
        "Learn the fundamentals of TypeScript and why it's become essential for modern web development.",
      author: "Sarah Johnson",
      date: "Nov 10, 2025",
      category: "Development",
      image:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=700&fit=crop",
      readTime: "5 min read",
      content: `TypeScript has revolutionized the way we write JavaScript applications...`,
    },
    {
      id: 2,
      title: "The Future of Web Design Trends",
      excerpt:
        "Explore the latest design trends shaping the web in 2025, from minimalism to immersive experiences.",
      author: "Michael Chen",
      date: "Nov 8, 2025",
      category: "Design",
      image:
        "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=700&fit=crop",
      readTime: "7 min read",
      content: `Web design continues to evolve at a rapid pace...`,
    },
    {
      id: 3,
      title: "Building Scalable Applications with React",
      excerpt:
        "Best practices and architectural patterns for creating maintainable React applications at scale.",
      author: "Emily Rodriguez",
      date: "Nov 5, 2025",
      category: "Development",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=700&fit=crop",
      readTime: "10 min read",
      content: `Building applications that scale requires thoughtful architecture...`,
    },
  ]);

  // Comments keyed by postId
  const [comments, setComments] = useState<Record<number, Comment[]>>({
    1: [
      {
        id: 1,
        postId: 1,
        author: "Aman",
        body: "Great intro — helped me set up TS quickly!",
        date: "Nov 11, 2025",
      },
    ],
    2: [],
    3: [],
  });

  const categories: string[] = ["All", "Development", "Design", "Technology"];
  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const featuredPost = blogPosts[0];

  // --- Add Blog ---
  const handleAddBlog = () => {
    if (
      !newBlog.title ||
      !newBlog.excerpt ||
      !newBlog.author ||
      !newBlog.category ||
      !newBlog.content
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const newPost: BlogPost = {
      id: blogPosts.length + 1,
      title: newBlog.title!,
      excerpt: newBlog.excerpt!,
      author: newBlog.author!,
      category: newBlog.category!,
      date: new Date().toLocaleDateString(),
      image:
        newBlog.image ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=700&fit=crop",
      readTime: newBlog.readTime || "5 min read",
      content: newBlog.content!,
    };

    setBlogPosts([newPost, ...blogPosts]);
    setComments((prev) => ({ ...prev, [newPost.id]: [] }));
    setIsAddModalOpen(false);
    setNewBlog({});
  };

  // --- Add Comment ---
  const handleAddComment = (postId: number) => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id:
        Object.values(comments)
          .flat()
          .reduce((m, c) => Math.max(m, c.id), 0) + 1,
      postId,
      author: "Anonymous",
      body: commentInput.trim(),
      date: new Date().toLocaleDateString(),
    };

    setComments((prev) => {
      const existing = prev[postId] ?? [];
      return { ...prev, [postId]: [newComment, ...existing] };
    });

    setCommentInput("");
  };

  // --- Delete Blog ---
  const handleDeleteBlog = (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );
    if (!confirmDelete) return;

    setBlogPosts((prev) => prev.filter((post) => post.id !== id));
    setComments((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setSelectedPost(null);
  };

  // --- Single Post View ---
  if (selectedPost) {
    const postComments = comments[selectedPost.id] ?? [];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">
                  TechBlog
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Post Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Articles
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {selectedPost.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 mb-6">
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <ThumbsUp className="h-4 w-4" /> Like
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              <Bookmark className="h-4 w-4" /> Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button
              onClick={() => handleDeleteBlog(selectedPost.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition ml-auto"
            >
              Delete
            </button>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-800 leading-relaxed">
              {selectedPost.content}
            </p>
          </div>

          {/* Comments */}
          <div className="mt-12 border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" /> Comments
            </h3>

            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <textarea
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                rows={3}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  onClick={() => setCommentInput("")}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  onClick={() => handleAddComment(selectedPost.id)}
                >
                  Post Comment
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {postComments.length === 0 ? (
                <p className="text-gray-600">No comments yet — be the first!</p>
              ) : (
                postComments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                        {c.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {c.author}
                        </div>
                        <div className="text-sm text-gray-500">{c.date}</div>
                      </div>
                    </div>
                    <p className="text-gray-800">{c.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // --- Home Page ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">
              TechBlog
            </span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Blog
          </button>
        </div>
      </nav>

      {/* Featured Post */}
      {featuredPost && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                Read More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.slice(1).map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer p-6"
          >
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full mb-3">
              {post.category}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{post.author}</span>
              </div>
              <span>{post.readTime}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">TechBlog</span>
            </div>
            <p className="text-gray-400">
              Your daily dose of tech insights and tutorials.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Articles
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  About
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Development
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Design
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Technology
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe for weekly updates and insights.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-lg text-gray-900"
              />
              <button className="bg-indigo-600 px-4 py-2 rounded-r-lg hover:bg-indigo-700">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 TechBlog. All rights reserved.</p>
        </div>
      </footer>

      {/* Add Blog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-5 text-gray-900">
              Add New Blog
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                value={newBlog.title || ""}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Excerpt"
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                value={newBlog.excerpt || ""}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, excerpt: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Author"
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                value={newBlog.author || ""}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, author: e.target.value })
                }
              />
              <select
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
                value={newBlog.category || ""}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, category: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories
                  .filter((cat) => cat !== "All")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
              <textarea
                placeholder="Content"
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                rows={5}
                value={newBlog.content || ""}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, content: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={handleAddBlog}
              >
                Add Blog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogApp;
