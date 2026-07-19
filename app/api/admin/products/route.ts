import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { z } from "zod";

const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.preprocess((val) => Number(val), z.number().int().min(0, "Variant stock cannot be negative")),
  price: z.preprocess((val) => val === '' || val == null ? undefined : Number(val), z.number().min(0, "Variant price cannot be negative").optional()),
  sku: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")).or(z.null()),
});

const productSchema = z.object({
  name: z.string().min(2, "Product name is too short").max(200, "Product name is too long"),
  description: z.string().min(5, "Description is too short").max(2000, "Description is too long"),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative")),
  stock: z.preprocess((val) => Number(val), z.number().int().min(0, "Stock cannot be negative")),
  imageUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  images: z.array(z.string()).optional(),
  category: z.string().optional(),
  variants: z.array(variantSchema).optional()
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (role !== "ADMIN" && role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(result.error.issues[0].message, { status: 400 });
    }

    const { name, description, price, stock, imageUrl, images, category, variants } = result.data;
    
    const totalStock = variants && variants.length > 0 
      ? variants.reduce((sum, v) => sum + v.stock, 0) 
      : stock;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock: totalStock,
        imageUrl: imageUrl || null,
        images: images && images.length > 0 ? {
          create: images.map(url => ({ url }))
        } : undefined,
        category: category || "Uncategorized",
        variants: variants && variants.length > 0 ? {
          create: variants.map(v => ({
            color: v.color || null,
            size: v.size || null,
            stock: v.stock,
            price: v.price || null,
            sku: v.sku || null,
            imageUrl: v.imageUrl || null
          }))
        } : undefined
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("ADMIN_PRODUCT_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
