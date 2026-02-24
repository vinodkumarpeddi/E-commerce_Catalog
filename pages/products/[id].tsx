import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import prisma from '@/lib/prisma';

interface SerializedProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
}

interface ProductDetailProps {
    product: SerializedProduct;
}

export default function ProductDetail({
    product,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { data: session } = useSession();
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const handleAddToCart = async () => {
        if (!session) {
            router.push('/api/auth/signin');
            return;
        }

        setAdding(true);
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity: 1 }),
            });

            if (res.ok) {
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
            }
        } catch (err) {
            console.error('Failed to add to cart:', err);
        } finally {
            setAdding(false);
        }
    };

    return (
        <>
            <Head>
                <title>{product.name} — ShopWave</title>
                <meta name="description" content={product.description} />
            </Head>

            <div className="container">
                <Link href="/" className="back-link">
                    ← Back to Products
                </Link>

                <div className="product-detail">
                    <div className="product-detail-image">
                        <img src={product.imageUrl} alt={product.name} loading="eager" />
                    </div>

                    <div className="product-detail-info">
                        <h1 data-testid="product-name" className="product-detail-name">
                            {product.name}
                        </h1>

                        <p data-testid="product-price" className="product-detail-price">
                            ${product.price.toFixed(2)}
                        </p>

                        <p
                            data-testid="product-description"
                            className="product-detail-description"
                        >
                            {product.description}
                        </p>

                        <button
                            data-testid="add-to-cart-button"
                            className={`btn btn-primary btn-lg ${added ? 'btn-success' : ''}`}
                            onClick={handleAddToCart}
                            disabled={adding}
                        >
                            {adding
                                ? 'Adding...'
                                : added
                                    ? '✓ Added to Cart'
                                    : 'Add to Cart'}
                        </button>

                        <div className="product-detail-meta">
                            <div className="meta-item">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    width="18"
                                    height="18"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Free Shipping
                            </div>
                            <div className="meta-item">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    width="18"
                                    height="18"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                30-Day Returns
                            </div>
                            <div className="meta-item">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    width="18"
                                    height="18"
                                >
                                    <rect x="1" y="3" width="15" height="13" />
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                                1-Year Warranty
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async (
    context
) => {
    const { id } = context.params as { id: string };

    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        return { notFound: true };
    }

    return {
        props: {
            product: {
                ...product,
                price: product.price,
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            },
        },
    };
};
