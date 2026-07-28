import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createJntOrder } from "@/lib/couriers/jnt";

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
          // Send order to J&T service (will use real API if keys exist, else returns mock)
          const jntResult = await createJntOrder({
            id: order.id,
            total: order.total,
            // Assuming formatting based on previous code
            receiverName: order.shippingAddress?.split(',')[0] || "Customer",
            receiverPhone: order.shippingAddress?.split(',')[1] || "No Phone",
            receiverAddress: order.shippingAddress || "No Address",
          });
          
          updates.trackingNumber = jntResult.trackingNumber;
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
