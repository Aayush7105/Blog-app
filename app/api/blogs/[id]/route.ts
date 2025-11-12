import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/Blog";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    await BlogPost.findByIdAndDelete(params.id);
    return Response.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("DELETE /api/blogs error:", error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return Response.json(
      { success: false, error: "Unknown server error" },
      { status: 500 }
    );
  }
}
