import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const adjustSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional().nullable(),
  type: z.enum(["RESTOCK", "REJECT", "MANUAL_ADJUSTMENT"]),
  quantity: z.number().int(),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (role !== "ADMIN" && role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = adjustSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(result.error.issues[0].message, { status: 400 });
    }

    const { productId, variantId, type, quantity, reason } = result.data;

    // We use a transaction to ensure both the stock count and log are updated together
    await prisma.$transaction(async (tx) => {
      // 1. Create the log entry
      await tx.inventoryLog.create({
        data: {
          productId,
          variantId: variantId || null,
          userId,
          type,
          quantity,
          reason,
        }
      });

      // 2. Determine stock changes based on type
      let stockChange = 0;
      let defectiveStockChange = 0;

      if (type === "RESTOCK") {
        stockChange = quantity; // e.g. received 50 new items
      } else if (type === "REJECT") {
        stockChange = -quantity; // e.g. remove 5 from good stock
        defectiveStockChange = quantity; // e.g. add 5 to defective stock
      } else if (type === "MANUAL_ADJUSTMENT") {
        stockChange = quantity; // e.g. +2 or -2 to correct a miscount
      }

      // 3. Update the specific variant (if applicable) and the main product
      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            stock: { increment: stockChange },
            defectiveStock: { increment: defectiveStockChange }
          }
        });
      }

      await tx.product.update({
        where: { id: productId },
        data: {
          stock: { increment: stockChange },
          defectiveStock: { increment: defectiveStockChange }
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_INVENTORY_ADJUST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
