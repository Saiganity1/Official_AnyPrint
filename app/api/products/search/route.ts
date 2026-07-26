import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        price: true,
        category: true
      },
      take: 5,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
