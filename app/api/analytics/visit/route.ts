import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Get today's date truncated to midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Upsert the visitor count for today
    await prisma.visitorStat.upsert({
      where: { date: today },
      update: { count: { increment: 1 } },
      create: { date: today, count: 1 }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("VISIT_TRACKING_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
