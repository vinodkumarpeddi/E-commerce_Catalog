import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const addToCartSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

const removeFromCartSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
});

async function getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: { product: true },
            },
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
    }

    return cart;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user || !('id' in session.user)) {
        return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    const userId = (session.user as { id: string }).id;

    try {
        switch (req.method) {
            case 'GET': {
                const cart = await getOrCreateCart(userId);
                return res.status(200).json(cart);
            }

            case 'POST': {
                const parseResult = addToCartSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(400).json({
                        error: 'Validation failed',
                        details: parseResult.error.issues,
                    });
                }

                const { productId, quantity } = parseResult.data;

                // Verify product exists
                const product = await prisma.product.findUnique({
                    where: { id: productId },
                });

                if (!product) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                // Get or create cart
                const cart = await getOrCreateCart(userId);

                // Upsert cart item
                await prisma.cartItem.upsert({
                    where: {
                        cartId_productId: {
                            cartId: cart.id,
                            productId,
                        },
                    },
                    update: {
                        quantity: { increment: quantity },
                    },
                    create: {
                        cartId: cart.id,
                        productId,
                        quantity,
                    },
                });

                // Return updated cart
                const updatedCart = await getOrCreateCart(userId);
                return res.status(200).json(updatedCart);
            }

            case 'DELETE': {
                const deleteParseResult = removeFromCartSchema.safeParse(req.body);
                if (!deleteParseResult.success) {
                    return res.status(400).json({
                        error: 'Validation failed',
                        details: deleteParseResult.error.issues,
                    });
                }

                const { productId: removeProductId } = deleteParseResult.data;

                const existingCart = await getOrCreateCart(userId);

                // Find the cart item
                const cartItem = await prisma.cartItem.findFirst({
                    where: {
                        cartId: existingCart.id,
                        productId: removeProductId,
                    },
                });

                if (!cartItem) {
                    return res.status(404).json({ error: 'Item not in cart' });
                }

                // Delete the cart item
                await prisma.cartItem.delete({
                    where: { id: cartItem.id },
                });

                // Return updated cart
                const updatedCart = await getOrCreateCart(userId);
                return res.status(200).json(updatedCart);
            }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                return res
                    .status(405)
                    .json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error('Cart API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
