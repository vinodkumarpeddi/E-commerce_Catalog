import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, FormEvent } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

const PRODUCTS_PER_PAGE = 12;

interface SerializedProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
}

interface HomeProps {
    products: SerializedProduct[];
    totalProducts: number;
    currentPage: number;
    searchQuery: string;
}

export default function Home({
    products,
    totalProducts,
    currentPage,
    searchQuery,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();
    const [search, setSearch] = useState(searchQuery || '');
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search.trim()) params.set('q', search.trim());
        params.set('page', '1');
        router.push(`/?${params.toString()}`);
    };

    return (
        <>
            <Head>
                <title>ShopWave — Premium E-Commerce Catalog</title>
                <meta
                    name="description"
                    content="Discover our curated collection of premium tech products. Shop the latest gadgets with server-side rendered pages for the fastest experience."
                />
            </Head>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Discover Premium Tech</h1>
                    <p className="hero-subtitle">
                        Curated collection of the finest gadgets and accessories
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-wrapper">
                            <svg
                                className="search-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                data-testid="search-input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="search-input"
                            />
                            <button
                                type="submit"
                                data-testid="search-button"
                                className="search-button"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Results Info */}
            <div className="container">
                <div className="results-info">
                    {searchQuery ? (
                        <p>
                            Showing results for <strong>&ldquo;{searchQuery}&rdquo;</strong> —{' '}
                            {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
                        </p>
                    ) : (
                        <p>{totalProducts} products available</p>
                    )}
                </div>

                {/* Product Grid */}
                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="empty-state">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="64"
                            height="64"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                        <h3>No products found</h3>
                        <p>Try a different search term or browse all products</p>
                        <Link href="/" className="btn btn-primary">
                            View All Products
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        {currentPage > 1 ? (
                            <Link
                                href={`/?${new URLSearchParams({
                                    ...(searchQuery ? { q: searchQuery } : {}),
                                    page: String(currentPage - 1),
                                }).toString()}`}
                                data-testid="pagination-prev"
                                className="btn btn-outline"
                            >
                                ← Previous
                            </Link>
                        ) : (
                            <span
                                data-testid="pagination-prev"
                                className="btn btn-outline btn-disabled"
                            >
                                ← Previous
                            </span>
                        )}

                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>

                        {currentPage < totalPages ? (
                            <Link
                                href={`/?${new URLSearchParams({
                                    ...(searchQuery ? { q: searchQuery } : {}),
                                    page: String(currentPage + 1),
                                }).toString()}`}
                                data-testid="pagination-next"
                                className="btn btn-outline"
                            >
                                Next →
                            </Link>
                        ) : (
                            <span
                                data-testid="pagination-next"
                                className="btn btn-outline btn-disabled"
                            >
                                Next →
                            </span>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
    context
) => {
    const { q, page = '1' } = context.query as { q?: string; page?: string };
    const currentPage = Math.max(1, parseInt(page, 10) || 1);

    const where = q
        ? {
            OR: [
                { name: { contains: q, mode: 'insensitive' as const } },
                { description: { contains: q, mode: 'insensitive' as const } },
            ],
        }
        : {};

    const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
            where,
            skip: (currentPage - 1) * PRODUCTS_PER_PAGE,
            take: PRODUCTS_PER_PAGE,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
    ]);

    return {
        props: {
            products: products.map((p) => ({
                ...p,
                price: p.price,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            })),
            totalProducts,
            currentPage,
            searchQuery: q || '',
        },
    };
};
