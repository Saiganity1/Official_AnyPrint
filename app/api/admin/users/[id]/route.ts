import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "OWNER") {
      return new NextResponse("Unauthorized. Only the Owner can manage user roles.", { status: 403 });
    }

    const resolvedParams = await params;
    const { newRole } = await req.json();

    if (!newRole || !['USER', 'ADMIN'].includes(newRole)) {
      return new NextResponse("Valid role is required", { status: 400 });
    }

    // Protect against modifying another OWNER's role
    const targetUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (targetUser.role === "OWNER") {
      return new NextResponse("Cannot modify an Owner's role", { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: { role: newRole }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("ADMIN_USER_UPDATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
