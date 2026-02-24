import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import CartItemRow from '@/components/CartItemRow';

interface CartProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
}

interface CartItem {
    id: string;
    quantity: number;
    product: CartProduct;
}

interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CartPage() {
    const { data: session } = useSession();
    const {
        data: cart,
        error,
        isLoading,
        mutate,
    } = useSWR<Cart>(session ? '/api/cart' : null, fetcher);

    const handleRemove = async (productId: string) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            if (res.ok) {
                mutate();
            }
        } catch (err) {
            console.error('Failed to remove item:', err);
        }
    };

    const handleQuantityChange = async (
        productId: string,
        newQuantity: number
    ) => {
        if (newQuantity < 1) {
            handleRemove(productId);
            return;
        }

        try {
            // Remove then re-add with the correct quantity
            await fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: newQuantity }),
            });

            mutate();
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const cartTotal =
        cart?.items?.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        ) || 0;

    if (isLoading) {
        return (
            <>
                <Head>
                    <title>Shopping Cart — ShopWave</title>
                </Head>
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading your cart...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head>
                    <title>Shopping Cart — ShopWave</title>
                </Head>
                <div className="container">
                    <div className="empty-state">
                        <h3>Error loading cart</h3>
                        <p>Please try refreshing the page.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Shopping Cart — ShopWave</title>
                <meta
                    name="description"
                    content="Review your shopping cart and proceed to checkout."
                />
            </Head>

            <div className="container">
                <h1 className="page-title">Shopping Cart</h1>

                {!cart?.items?.length ? (
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
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <h3>Your cart is empty</h3>
                        <p>Start shopping to add items to your cart</p>
                        <Link href="/" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {cart.items.map((item) => (
                                <CartItemRow
                                    key={item.id}
                                    item={item}
                                    onRemove={handleRemove}
                                    onQuantityChange={handleQuantityChange}
                                />
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="cart-summary-card">
                                <h2>Order Summary</h2>
                                <div className="summary-row">
                                    <span>
                                        Items ({cart.items.reduce((s, i) => s + i.quantity, 0)})
                                    </span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className="free-shipping">FREE</span>
                                </div>
                                <div className="summary-divider" />
                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span data-testid="cart-total">
                                        ${cartTotal.toFixed(2)}
                                    </span>
                                </div>
                                <button className="btn btn-primary btn-lg btn-full">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
