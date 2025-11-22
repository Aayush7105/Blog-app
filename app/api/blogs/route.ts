import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    // 🔥 Proper session fetch for App Router
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const newPost = await Blog.create({
      ...body,
      author: session.user.name,
      authorEmail: session.user.email,
      authorId: session.user.mongoId,
    });

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
