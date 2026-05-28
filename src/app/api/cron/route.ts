import { NextRequest, NextResponse } from "next/server";
import { monitorAllProjects } from "@/services/monitoring";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await monitorAllProjects();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron monitoring failed:", error);
    return NextResponse.json(
      { error: "Monitoring failed" },
      { status: 500 }
    );
  }
}
