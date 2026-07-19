import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100, "Name is too long").optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number too short").max(20, "Phone number too long").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters")
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"]
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(result.error.issues[0].message, { status: 400 });
    }

    const { name, email, phone, password } = result.data;

    // Check if user exists
    if (email) {
      const existEmail = await prisma.user.findUnique({ where: { email } });
      if (existEmail) return new NextResponse("Email already exists", { status: 400 });
    }

    if (phone) {
      const existPhone = await prisma.user.findUnique({ where: { phone } });
      if (existPhone) return new NextResponse("Phone already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Initial Owner Logic
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "OWNER" : "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        role
      }
    });

    return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
    });
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
