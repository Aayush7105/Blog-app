import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Comment from "@/models/Comments";

export async function POST(req: Request) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" });
  }

  const body = await req.json();

  const newComment = await Comment.create({
    blogId: body.blogId,
    content: body.content,
    userName: session.user.name,
    userEmail: session.user.email,
    date: new Date().toLocaleDateString(),
  });

  return NextResponse.json({ success: true, comment: newComment });
}
