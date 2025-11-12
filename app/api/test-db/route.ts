import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    const state = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];

    return Response.json({
      success: true,
      status: states[state],
    });
  } catch (error) {
    return Response.json({
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown connection error",
    });
  }
}
