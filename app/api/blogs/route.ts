import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";

// --- Get all blogs ---
export async function GET() {
  await connectToDatabase();
  const blogs = await Blog.find().sort({ _id: -1 });
  return NextResponse.json(blogs);
}

// --- Add a new blog ---
export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();

  const newBlog = await Blog.create({
    ...body,
    date: new Date().toLocaleDateString(),
  });

  return NextResponse.json(newBlog);
}
