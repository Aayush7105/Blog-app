import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ await params (new Next.js behavior)

  try {
    await connectToDatabase();
    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error deleting";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
