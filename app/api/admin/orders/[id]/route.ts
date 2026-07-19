import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "ADMIN" && role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const { status, trackingNumber } = await req.json();

    if (!status && trackingNumber === undefined) {
      return new NextResponse("Status or tracking number is required", { status: 400 });
    }

    // Get existing order to check if status changed
    const existingOrder = await prisma.order.findUnique({
      where: { id: resolvedParams.id },
      include: { user: true }
    });

    const order = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { 
        ...(status !== undefined && { status }),
        ...(trackingNumber !== undefined && { trackingNumber })
      }
    });

    // Send email notification if status changed and user has an email
    if (existingOrder && existingOrder.status !== status && existingOrder.user?.email) {
      const userEmail = existingOrder.user.email;
      const trackingInfo = order.trackingNumber ? `<p>Your tracking number is: <strong>${order.trackingNumber}</strong></p><p>Track it here: <a href="https://www.jtexpress.ph/index/query/gzquery.html?bills=${order.trackingNumber}">J&T Express Tracking</a></p>` : '';

      if (status === "PROCESSING") {
        await sendEmail({
          to: userEmail,
          subject: `Your Anyprint order is being processed!`,
          html: `<h2>Order ${order.id.slice(-8).toUpperCase()}</h2><p>Good news! We have started processing your order.</p><p>We will notify you again once it has shipped.</p>`
        });
      } else if (status === "SHIPPED") {
        await sendEmail({
          to: userEmail,
          subject: `Your Anyprint order has shipped!`,
          html: `<h2>Order ${order.id.slice(-8).toUpperCase()}</h2><p>Your order has been handed over to our courier.</p><p>Total Amount (COD): <strong>₱${order.total.toFixed(2)}</strong></p>${trackingInfo}`
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("ADMIN_ORDER_UPDATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
