import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import User from "@/models/User";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: rawEmail } = await params;
    const email = decodeURIComponent(rawEmail || "");
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Missing author email" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    let posts = await Blog.find({ authorEmail: email }).sort({ date: -1 });

    if (posts.length === 0) {
      const user = await User.findOne({ email });
      if (user?.name) {
        posts = await Blog.find({ author: user.name }).sort({ date: -1 });
      }
    }

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching author blogs:", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
