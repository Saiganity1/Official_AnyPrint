import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "ADMIN" && role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { orderIds } = await req.json();

    if (!orderIds || !Array.isArray(orderIds)) {
      return new NextResponse("Invalid order IDs", { status: 400 });
    }

    // Process orders: If pending, change to PROCESSING and generate tracking
    const processedIds: string[] = [];

    for (const id of orderIds) {
      const order = await prisma.order.findUnique({ where: { id } });
      if (order) {
        let updates: any = {};
        
        // Always set status to PROCESSING if it's PENDING
        if (order.status === "PENDING") {
          updates.status = "PROCESSING";
        }

        // Generate tracking number if it doesn't exist
        if (!order.trackingNumber) {
          // Generate a fake J&T tracking number: JT + 12 digits
          const random12 = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
          updates.trackingNumber = `JT${random12}`;
        }

        if (Object.keys(updates).length > 0) {
          await prisma.order.update({
            where: { id },
            data: updates
          });
        }
        processedIds.push(id);
      }
    }

    return NextResponse.json({ success: true, processedIds });
  } catch (error) {
    console.error("BULK_PROCESS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
