import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    return (
        <div className="app">
            <header className="header">
                <div className="header-inner">
                    <Link href="/" className="logo">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="28"
                            height="28"
                        >
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        <span>ShopWave</span>
                    </Link>

                    <nav className="nav">
                        <Link
                            href="/"
                            className={`nav-link ${router.pathname === '/' ? 'active' : ''}`}
                        >
                            Products
                        </Link>

                        {session && (
                            <Link
                                href="/cart"
                                className={`nav-link ${router.pathname === '/cart' ? 'active' : ''}`}
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
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                Cart
                            </Link>
                        )}

                        {status === 'loading' ? (
                            <span className="nav-link">...</span>
                        ) : session ? (
                            <div className="user-menu">
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="user-avatar"
                                    />
                                )}
                                <span className="user-name">{session.user?.name}</span>
                                <button
                                    data-testid="signout-button"
                                    onClick={() => signOut()}
                                    className="btn btn-outline btn-sm"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                data-testid="signin-button"
                                onClick={() => signIn()}
                                className="btn btn-primary btn-sm"
                            >
                                Sign In
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="main">{children}</main>

            <footer className="footer">
                <div className="footer-inner">
                    <p>
                        © 2026 ShopWave. Built with Next.js, Prisma &amp; NextAuth.js
                    </p>
                </div>
            </footer>
        </div>
    );
}
