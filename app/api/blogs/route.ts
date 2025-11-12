import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";

// --- GET all blogs ---
export async function GET() {
  try {
    await connectToDatabase();
    const posts = await Blog.find().sort({ date: -1 });
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// --- POST new blog ---
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const newPost = await Blog.create(body);
    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error("Error adding blog:", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
