import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't leak whether the email exists or not
      return NextResponse.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
    }

    // Check if user is an OAuth user without a password
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google to sign in. Please sign in with Google." },
        { status: 400 }
      );
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Token expires in 1 hour
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Save token in DB
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendPasswordResetEmail(email, token);
    } else {
      console.warn("Email credentials not set. Simulated password reset email for:", email, "Token:", token);
      // Fallback for dev environment without email set up
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ 
          success: true, 
          message: "Check server logs for reset link (Email credentials not configured)."
        });
      }
    }

    return NextResponse.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
