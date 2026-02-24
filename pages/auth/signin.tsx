import { GetServerSideProps } from 'next';
import { getProviders, signIn, getCsrfToken } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import Head from 'next/head';
import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';

interface Provider {
    id: string;
    name: string;
    type: string;
}

interface SignInPageProps {
    providers: Record<string, Provider>;
    csrfToken: string | undefined;
}

export default function SignInPage({ providers, csrfToken }: SignInPageProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const callbackUrl = (router.query.callbackUrl as string) || '/';

    const handleCredentialsSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else if (result?.url) {
            router.push(result.url);
        }
    };

    return (
        <>
            <Head>
                <title>Sign In — ShopWave</title>
                <meta name="description" content="Sign in to your ShopWave account" />
            </Head>

            <div className="signin-page">
                <div className="signin-card">
                    <div className="signin-header">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="36"
                            height="36"
                        >
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        <h1>Welcome Back</h1>
                        <p>Sign in to your ShopWave account</p>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleCredentialsSubmit} className="signin-form">
                        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

                        {error && <div className="signin-error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="form-input"
                            />
                        </div>

                        <button
                            type="submit"
                            data-testid="signin-button"
                            className="btn btn-primary btn-lg btn-full"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    {providers &&
                        Object.keys(providers).filter((p) => p !== 'credentials').length >
                        0 && (
                            <>
                                <div className="signin-divider">
                                    <span>or continue with</span>
                                </div>

                                <div className="signin-providers">
                                    {Object.values(providers)
                                        .filter((provider) => provider.id !== 'credentials')
                                        .map((provider) => (
                                            <button
                                                key={provider.id}
                                                onClick={() => signIn(provider.id, { callbackUrl })}
                                                className="btn btn-outline btn-lg btn-full provider-btn"
                                            >
                                                {provider.id === 'github' && (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        width="20"
                                                        height="20"
                                                    >
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    </svg>
                                                )}
                                                Sign in with {provider.name}
                                            </button>
                                        ))}
                                </div>
                            </>
                        )}

                    <p className="signin-footer">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="signin-link">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (session) {
        return { redirect: { destination: '/', permanent: false } };
    }

    const providers = await getProviders();
    const csrfToken = await getCsrfToken(context);

    return {
        props: {
            providers: providers ?? {},
            csrfToken: csrfToken ?? null,
        },
    };
};
