import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "OWNER") {
      return new NextResponse("Unauthorized. Only the owner can manage bans.", { status: 403 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    const { action } = body; // "BAN_PERMANENT", "BAN_3_DAYS", "BAN_7_DAYS", "UNBAN"

    if (!action) {
      return new NextResponse("Missing action", { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (targetUser.role === "OWNER") {
      return new NextResponse("Cannot ban the owner", { status: 400 });
    }

    let isBanned = false;
    let bannedUntil = null;

    if (action === "BAN_PERMANENT") {
      isBanned = true;
    } else if (action === "BAN_3_DAYS") {
      isBanned = true;
      const date = new Date();
      date.setDate(date.getDate() + 3);
      bannedUntil = date;
    } else if (action === "BAN_7_DAYS") {
      isBanned = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      bannedUntil = date;
    } else if (action === "UNBAN") {
      isBanned = false;
      bannedUntil = null;
    } else {
      return new NextResponse("Invalid action", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: { isBanned, bannedUntil }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("ADMIN_USER_BAN_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
