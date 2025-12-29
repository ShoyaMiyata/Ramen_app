import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId, sessionId } = await auth();

    return NextResponse.json({
      userId,
      sessionId,
      isAuthenticated: !!userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get session info",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
