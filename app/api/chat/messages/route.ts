import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let conversation;

    if (productId) {
      conversation = await prisma.conversation.findFirst({
        where: { userId, productId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    } else {
      // Find the most recently active conversation for this user
      conversation = await prisma.conversation.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!conversation) {
      return NextResponse.json([]);
    }

    // Mark messages as read by USER if they were sent by ADMIN or OWNER
    const unreadAdminMessages = conversation.messages.filter(m => (m.senderRole === "ADMIN" || m.senderRole === "OWNER") && !m.isRead);
    if (unreadAdminMessages.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadAdminMessages.map(m => m.id) } },
        data: { isRead: true }
      });
    }

    return NextResponse.json(conversation.messages);
  } catch (error) {
    console.error("CHAT_MESSAGES_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, productId } = body;

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Find or create conversation
    let conversation;
    if (productId) {
      conversation = await prisma.conversation.findFirst({
        where: { userId, productId }
      });
    } else {
      // Find the most recently active conversation for this user
      conversation = await prisma.conversation.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          productId: productId || null
        }
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderRole: "USER",
        content
      }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("CHAT_MESSAGES_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
