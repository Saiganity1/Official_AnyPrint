import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { z } from "zod";

const variantSchema = z.object({
  id: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.preprocess((val) => Number(val), z.number().int().min(0, "Variant stock cannot be negative")),
  price: z.preprocess((val) => val === '' || val == null ? undefined : Number(val), z.number().min(0, "Variant price cannot be negative").optional()),
  sku: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")).or(z.null()),
});

const updateProductSchema = z.object({
  name: z.string().min(2, "Product name is too short").max(200, "Product name is too long").optional(),
  description: z.string().min(5, "Description is too short").max(2000, "Description is too long").optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative")).optional(),
  stock: z.preprocess((val) => Number(val), z.number().int().min(0, "Stock cannot be negative")).optional(),
  imageUrl: z.string().optional().or(z.literal("")).or(z.null()),
  images: z.array(z.string()).optional(),
  category: z.string().optional(),
  variants: z.array(variantSchema).optional()
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "ADMIN" && role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(result.error.issues[0].message, { status: 400 });
    }

    const { name, description, price, stock, imageUrl, images, category, variants } = result.data;
    
    // Calculate total stock if variants are provided
    let totalStock = stock;
    if (variants && variants.length > 0) {
      totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    }

    const product = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(totalStock !== undefined && { stock: totalStock }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(images !== undefined && {
          images: {
            deleteMany: {}, // replace all existing images
            create: images.map(url => ({ url }))
          }
        }),
        ...(category !== undefined && { category }),
        ...(variants !== undefined && {
          variants: {
            deleteMany: {
              id: { notIn: variants.filter(v => v.id).map(v => v.id as string) }
            },
            upsert: variants.map(v => ({
              where: { id: v.id || 'new-id-that-will-not-match' },
              create: {
                color: v.color || null,
                size: v.size || null,
                stock: v.stock,
                price: v.price || null,
                sku: v.sku || null,
                imageUrl: v.imageUrl || null
              },
              update: {
                color: v.color || null,
                size: v.size || null,
                stock: v.stock,
                price: v.price || null,
                sku: v.sku || null,
                imageUrl: v.imageUrl || null
              }
            }))
          }
        })
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("ADMIN_PRODUCT_UPDATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "ADMIN" && role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    // Check if product is in any orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: resolvedParams.id }
    });

    if (orderItemsCount > 0) {
      return new NextResponse("Cannot delete product because it has been ordered by customers. Please edit the product and set stock to 0 instead.", { status: 400 });
    }

    await prisma.product.delete({
      where: { id: resolvedParams.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("ADMIN_PRODUCT_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
