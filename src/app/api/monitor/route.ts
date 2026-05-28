import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        clientName: true,
        url: true,
        thumbnail: true,
        currentStatus: true,
        responseTime: true,
        lastCheckedAt: true,
      },
    });

    const stats = {
      total: projects.length,
      up: projects.filter((p) => p.currentStatus === "UP").length,
      down: projects.filter((p) => p.currentStatus === "DOWN").length,
      checking: projects.filter((p) => p.currentStatus === "CHECKING").length,
    };

    return NextResponse.json({ projects, stats });
  } catch (error) {
    console.error("Monitor API error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
