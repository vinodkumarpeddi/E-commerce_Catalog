import Link from 'next/link';
import { ChangeEvent } from 'react';

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

interface CartItemRowProps {
    item: CartItem;
    onRemove: (productId: string) => void;
    onQuantityChange: (productId: string, newQuantity: number) => void;
}

export default function CartItemRow({
    item,
    onRemove,
    onQuantityChange,
}: CartItemRowProps) {
    const { product, quantity } = item;

    return (
        <div data-testid={`cart-item-${product.id}`} className="cart-item">
            <div className="cart-item-image">
                <img src={product.imageUrl} alt={product.name} />
            </div>

            <div className="cart-item-details">
                <Link href={`/products/${product.id}`} className="cart-item-name">
                    {product.name}
                </Link>
                <p className="cart-item-price">${product.price.toFixed(2)}</p>
            </div>

            <div className="cart-item-quantity">
                <button
                    className="qty-btn"
                    onClick={() => onQuantityChange(product.id, quantity - 1)}
                    aria-label="Decrease quantity"
                >
                    −
                </button>
                <input
                    data-testid={`quantity-input-${product.id}`}
                    type="number"
                    className="qty-input"
                    value={quantity}
                    min="1"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onQuantityChange(
                            product.id,
                            parseInt(e.target.value, 10) || 1
                        )
                    }
                    aria-label="Item quantity"
                />
                <button
                    className="qty-btn"
                    onClick={() => onQuantityChange(product.id, quantity + 1)}
                    aria-label="Increase quantity"
                >
                    +
                </button>
            </div>

            <div className="cart-item-subtotal">
                ${(product.price * quantity).toFixed(2)}
            </div>

            <button
                data-testid={`remove-item-button-${product.id}`}
                className="btn-remove"
                onClick={() => onRemove(product.id)}
                aria-label={`Remove ${product.name} from cart`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="18"
                    height="18"
                >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            </button>
        </div>
    );
}
