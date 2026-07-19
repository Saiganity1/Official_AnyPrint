import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  phone: z.string().min(10, "Phone number is too short"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().optional(),
  province: z.string().optional(),
  zipCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.errors },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const { phone, address, city, province, zipCode } = result.data;

    // Check if phone number is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: { phone, id: { not: userId } },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number is already associated with another account." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { phone, address, city, province, zipCode },
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
