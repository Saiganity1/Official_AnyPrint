import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { z } from "zod";

const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    productId: z.string(),
    variantId: z.string().optional(),
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().int().min(1)
  })).min(1, "Cart is empty"),
  total: z.number().min(0),
  shippingAddress: z.string().min(5, "Shipping address is too short").max(500, "Shipping address is too long"),
  saveAddress: z.boolean().optional(),
  addressData: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional()
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const userId = (session?.user as any)?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(result.error.issues[0].message, { status: 400 });
    }

    const { items, total, shippingAddress, saveAddress, addressData } = result.data;

    let serverTotal = 0;
    const validatedItems: any[] = [];

    // Verify stock and calculate TRUE price before creating order
    for (const item of items) {
      let truePrice = 0;

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ 
          where: { id: item.variantId },
          include: { product: true }
        });
        if (!variant) {
          return new NextResponse(`Variant not found for: ${item.name}`, { status: 400 });
        }
        if (variant.stock < item.quantity) {
          return new NextResponse(`Not enough stock for ${item.name}. Available: ${variant.stock}`, { status: 400 });
        }
        truePrice = variant.price !== null ? variant.price : variant.product.price;
      } else {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          return new NextResponse(`Product not found: ${item.name}`, { status: 400 });
        }
        if (product.stock < item.quantity) {
          return new NextResponse(`Not enough stock for ${product.name}. Available: ${product.stock}`, { status: 400 });
        }
        truePrice = product.price;
      }

      validatedItems.push({
        ...item,
        price: truePrice
      });
      serverTotal += truePrice * item.quantity;
    }

    // Create the order and deduct stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Save address if requested
      if (saveAddress && addressData) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            address: addressData.address,
            city: addressData.city,
            province: addressData.province,
            zipCode: addressData.zipCode,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
          }
        });
      }

      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total: serverTotal,
          shippingAddress: shippingAddress,
          latitude: addressData?.latitude,
          longitude: addressData?.longitude,
          status: "PENDING",
          items: {
            create: validatedItems.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      for (const item of items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
          // Also decrement the main product stock to keep it consistent
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              salesCount: { increment: item.quantity }
            }
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              salesCount: { increment: item.quantity }
            }
          });
        }

        // Log the inventory deduction
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            variantId: item.variantId || null,
            userId: user.id,
            type: "SALE",
            quantity: -item.quantity,
            reason: `Order placed (ID: ${newOrder.id})`
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("CHECKOUT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
