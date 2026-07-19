import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "ADMIN" && role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    
    // Mark user messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: resolvedParams.conversationId,
        senderRole: "USER",
        isRead: false
      },
      data: { isRead: true }
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: resolvedParams.conversationId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("ADMIN_CHAT_MESSAGES_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "ADMIN" && role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const { content } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: resolvedParams.conversationId,
        senderRole: role,
        content
      }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: resolvedParams.conversationId },
      data: { updatedAt: new Date() }
    });

    // Handle Email Fallback
    const conversation = await prisma.conversation.findUnique({
      where: { id: resolvedParams.conversationId },
      include: { user: true, product: true }
    });

    if (conversation?.user?.email) {
      const productContext = conversation.product ? ` regarding <strong>${conversation.product.name}</strong>` : '';
      
      await sendEmail({
        to: conversation.user.email,
        subject: `New Message from Anyprint Avenue`,
        html: `
          <h2>Anyprint Avenue sent you a message${productContext}!</h2>
          <div style="padding: 1rem; border-left: 4px solid #000; background: #f9f9f9; margin: 1rem 0;">
            ${content}
          </div>
          <p>Please log in to your account to reply.</p>
        `
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("ADMIN_CHAT_MESSAGES_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
