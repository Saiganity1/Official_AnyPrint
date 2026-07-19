import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return new NextResponse("Invalid rating", { status: 400 });
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: resolvedParams.id
        }
      }
    });

    if (existingReview) {
      return new NextResponse("You have already reviewed this product", { status: 400 });
    }

    // Check if user purchased the product
    const purchaseCount = await prisma.orderItem.count({
      where: {
        productId: resolvedParams.id,
        order: { userId }
      }
    });

    if (purchaseCount === 0) {
      return new NextResponse("You must purchase this product before reviewing it.", { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        productId: resolvedParams.id,
        userId
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("CREATE_REVIEW_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
