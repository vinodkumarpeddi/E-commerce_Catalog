# ShopWave — E-Commerce Product Catalog

A modern, full-stack e-commerce product catalog built with **Next.js**, **Prisma**, **NextAuth.js**, and **PostgreSQL**. Features server-side rendering (SSR), API routes for cart management, and OAuth authentication.

## 🚀 Features

- **Server-Side Rendering (SSR)** — Product pages are rendered on the server for optimal SEO and performance
- **Server-Side Search & Pagination** — Filter and paginate products via URL query parameters
- **OAuth Authentication** — GitHub login via NextAuth.js with Prisma adapter
- **Shopping Cart API** — RESTful cart management with Zod validation
- **Protected Routes** — Middleware-based route protection for authenticated pages
- **Premium Dark UI** — Modern design with glassmorphism, gradients, and micro-animations
- **Fully Containerized** — Docker Compose for one-command setup

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- (Optional) [Node.js 18+](https://nodejs.org/) for local development

## 🏁 Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce-catalog
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure OAuth** (optional for testing)
   - Create a [GitHub OAuth App](https://github.com/settings/developers)
   - Set `GITHUB_ID` and `GITHUB_SECRET` in `.env`

4. **Start the application**
   ```bash
   docker-compose up --build
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

The database is automatically seeded with 24 products and a test user on first startup.

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL (via Docker)
docker-compose up db -d

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database (runs automatically in Docker)
psql postgresql://user:password@localhost:5432/ecommerce < prisma/seed-data/01-init.sql

# Start dev server
npm run dev
```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@db:5432/ecommerce` |
| `NEXTAUTH_URL` | App canonical URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | JWT signing secret | `your-secret-key` |
| `GITHUB_ID` | GitHub OAuth App Client ID | `Iv1.abc123` |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret | `secret123` |

## 📁 Project Structure

```
├── components/          # React components
│   ├── Layout.js        # App shell with header/footer
│   ├── ProductCard.js   # Product grid card
│   └── CartItemRow.js   # Cart item display
├── lib/
│   └── prisma.js        # Prisma client singleton
├── pages/
│   ├── api/
│   │   ├── auth/[...nextauth].js  # NextAuth config
│   │   └── cart/index.js          # Cart CRUD API
│   ├── products/[id].js           # Product detail (SSR)
│   ├── _app.js                    # App wrapper
│   ├── cart.js                    # Shopping cart page
│   └── index.js                   # Product listing (SSR)
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed-data/01-init.sql      # Seed script
├── styles/globals.css             # Global styles
├── middleware.js                   # Route protection
├── docker-compose.yml             # Service orchestration
├── Dockerfile                     # App container build
└── submission.json                # Test credentials
```

## 🧪 Test User

The seeded database includes a test user for automated evaluation:

```json
{
  "email": "test.user@example.com",
  "name": "Test User"
}
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/providers` | No | List OAuth providers |
| GET | `/api/auth/signin` | No | Sign-in page |
| GET | `/api/cart` | Yes | Get user's cart |
| POST | `/api/cart` | Yes | Add item to cart |
| DELETE | `/api/cart` | Yes | Remove item from cart |

### Cart Request Bodies

**POST /api/cart**
```json
{ "productId": "prod-001", "quantity": 1 }
```

**DELETE /api/cart**
```json
{ "productId": "prod-001" }
```

## 🏷 data-testid Reference

All interactive elements are instrumented with `data-testid` for E2E testing. See the project requirements for the complete list.
