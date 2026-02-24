import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, MouseEvent } from 'react';
import { useToast } from '@/components/Toast';

interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { addToast } = useToast();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const handleAddToCart = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push('/auth/signin');
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
                addToast(`${product.name} added to cart`, 'success');
                setTimeout(() => setAdded(false), 2000);
            } else {
                addToast('Failed to add to cart', 'error');
            }
        } catch {
            addToast('Network error', 'error');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div data-testid={`product-card-${product.id}`} className="product-card">
            <Link href={`/products/${product.id}`} className="product-card-link">
                <div className="product-card-image">
                    <img src={product.imageUrl} alt={product.name} loading="lazy" />
                </div>
                <div className="product-card-body">
                    <h3 className="product-card-name">{product.name}</h3>
                    <p className="product-card-price">${product.price.toFixed(2)}</p>
                </div>
            </Link>
            <div className="product-card-actions">
                <button
                    data-testid={`add-to-cart-button-${product.id}`}
                    className={`btn btn-primary btn-sm btn-full ${added ? 'btn-success' : ''}`}
                    onClick={handleAddToCart}
                    disabled={adding}
                >
                    {adding ? 'Adding...' : added ? '✓ Added' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
