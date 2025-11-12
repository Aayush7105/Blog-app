import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    const state = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];

    return Response.json({
      success: true,
      status: states[state],
      message: `Database is currently ${states[state]}`,
    });
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to connect to MongoDB",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
