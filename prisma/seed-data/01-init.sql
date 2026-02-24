-- ============================================================
-- E-Commerce Catalog - Database Seed Script
-- Automatically executed by PostgreSQL on container startup
-- ============================================================

-- ─── Create Extension for cuid-like IDs ─────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to generate cuid-like IDs
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
BEGIN
  RETURN 'c' || encode(gen_random_bytes(12), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ─── Create Tables ──────────────────────────────────────────

-- NextAuth: User
CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "name"          TEXT,
  "email"         TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  "image"         TEXT,
  "password"      TEXT
);

-- NextAuth: Account
CREATE TABLE IF NOT EXISTS "Account" (
  "id"                TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "userId"            TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,
  UNIQUE("provider", "providerAccountId")
);

-- NextAuth: Session
CREATE TABLE IF NOT EXISTS "Session" (
  "id"           TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expires"      TIMESTAMPTZ NOT NULL
);

-- NextAuth: VerificationToken
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token"      TEXT UNIQUE NOT NULL,
  "expires"    TIMESTAMPTZ NOT NULL,
  UNIQUE("identifier", "token")
);

-- Product
CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "name"        TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price"       DOUBLE PRECISION NOT NULL,
  "imageUrl"    TEXT NOT NULL,
  "createdAt"   TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ DEFAULT NOW()
);

-- Cart
CREATE TABLE IF NOT EXISTS "Cart" (
  "id"     TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

-- CartItem
CREATE TABLE IF NOT EXISTS "CartItem" (
  "id"        TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "quantity"  INTEGER DEFAULT 1,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "cartId"    TEXT NOT NULL REFERENCES "Cart"("id") ON DELETE CASCADE,
  UNIQUE("cartId", "productId")
);

-- ─── Seed: Test User ────────────────────────────────────────

-- Password is 'password123' hashed with bcrypt (10 rounds)
INSERT INTO "User" ("id", "name", "email", "image", "password") VALUES
  ('test-user-001', 'Test User', 'test.user@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser', '$2a$10$K4YKMwqfT0LZr0B1yZoQ6eKT5j8yGzg1e9w4Z1V5Y0nJ5c8K0MXHK')
ON CONFLICT ("email") DO NOTHING;

-- ─── Seed: Products ─────────────────────────────────────────

INSERT INTO "Product" ("id", "name", "description", "price", "imageUrl") VALUES
  ('prod-001', 'Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Hi-Res Audio support. Perfect for music lovers and professionals.', 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'),
  ('prod-002', 'Ultra-Slim Laptop 15"', 'Powerful 15-inch laptop with M2 chip, 16GB RAM, 512GB SSD, and stunning Retina display. Weighs just 3.4 lbs for ultimate portability.', 1299.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop'),
  ('prod-004', 'Smart Fitness Watch', 'Advanced fitness tracker with heart rate monitor, GPS, sleep tracking, and 7-day battery life. Water-resistant to 50 meters with always-on display.', 249.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'),
  ('prod-005', 'Portable Bluetooth Speaker', 'Waterproof portable speaker with 360-degree sound, 20-hour playtime, and built-in power bank. Perfect for outdoor adventures.', 89.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop'),
  ('prod-006', 'Professional Camera Drone', 'Foldable 4K camera drone with 3-axis gimbal stabilization, 45-minute flight time, and intelligent flight modes. Capture stunning aerial footage.', 799.00, 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500&h=500&fit=crop'),
  ('prod-007', 'Ergonomic Office Chair', 'Premium mesh ergonomic chair with lumbar support, adjustable armrests, headrest, and seat depth. Designed for 8+ hours of comfortable sitting.', 449.00, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'),
  ('prod-008', 'Smart Home Hub', 'Central smart home controller with voice assistant, Zigbee/Z-Wave support, and 7-inch touchscreen. Controls lights, locks, thermostats and more.', 179.99, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500&h=500&fit=crop'),
  ('prod-009', 'Wireless Charging Pad', 'Fast wireless charger compatible with all Qi devices. Features LED indicator, foreign object detection, and sleek minimalist design.', 39.99, 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=500&h=500&fit=crop'),
  ('prod-010', 'Ultrawide Gaming Monitor 34"', '34-inch curved ultrawide monitor with 144Hz refresh rate, 1ms response time, and HDR600. Immersive gaming and productivity experience.', 599.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop'),
  ('prod-012', 'Mechanical Pencil Set', 'Professional drafting set with 0.3mm, 0.5mm, and 0.7mm mechanical pencils. Includes lead refills, erasers, and premium carrying case.', 34.99, 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&h=500&fit=crop'),
  ('prod-013', 'Electric Standing Desk', 'Motorized sit-stand desk with programmable height presets, anti-collision system, and bamboo top. Supports up to 300 lbs.', 549.00, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&h=500&fit=crop'),
  ('prod-014', 'USB-C Hub Adapter', '11-in-1 USB-C hub with HDMI 4K, Ethernet, SD card readers, USB 3.0 ports, and 100W power delivery pass-through. Universal compatibility.', 59.99, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop'),
  ('prod-015', 'Leather Laptop Sleeve', 'Handcrafted genuine leather laptop sleeve for 13-15 inch devices. Features magnetic closure, interior pocket, and premium wool lining.', 79.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'),
  ('prod-016', 'Smart LED Light Strip', '16 million color RGBIC LED light strip with music sync, voice control, and scene modes. 32.8ft with adhesive backing and easy installation.', 29.99, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&h=500&fit=crop'),
  ('prod-017', 'Espresso Machine', 'Semi-automatic espresso machine with 15-bar pump, PID temperature control, steam wand, and built-in grinder. Barista-quality coffee at home.', 699.00, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop'),
  ('prod-018', 'Wireless Gaming Mouse', 'Ultra-lightweight wireless gaming mouse with 25K DPI sensor, 70-hour battery, and 5 programmable buttons. Sub-1ms latency for competitive play.', 79.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop'),
  ('prod-019', 'Portable Power Bank 20000mAh', 'High-capacity portable charger with 65W USB-C PD, dual USB-A ports, and LED display. Charges laptops, tablets, and phones simultaneously.', 49.99, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop'),
  ('prod-021', 'Premium Backpack', 'Water-resistant tech backpack with padded laptop compartment, USB charging port, anti-theft design, and ergonomic straps. 35L capacity.', 99.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'),
  ('prod-025', 'VR Headset Pro', 'Immersive virtual reality headset with 4K resolution per eye, inside-out tracking, and comfortable ergonomic design.', 499.00, 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=500&fit=crop'),
  ('prod-027', '4K Action Camera', 'Rugged waterproof action camera with native 4K/60fps video, HyperSmooth stabilization, and dual screens. Perfect for vlogging and sports.', 399.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'),
  ('prod-028', 'Wireless Charging Stand', '3-in-1 magnetic wireless charging stand for phone, watch, and earbuds. Sleek aluminum design with fast charging capabilities.', 59.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop'),
  ('prod-029', 'Smart Ring', 'Titanium smart ring tracking sleep, readiness, and daily activity. Water-resistant up to 100m with up to 7 days of battery life.', 299.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'),
  ('prod-030', 'Electric Scooter', 'Foldable commuter electric scooter with 18mph top speed, 20-mile range, and dual braking system. Features a bright LED headlight.', 449.00, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop'),
  ('prod-031', 'Portable Projector', 'Mini 1080p smart projector with built-in battery and Android TV. Projects up to 100 inches with automatic keystone correction.', 349.00, 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500&h=500&fit=crop'),
  ('prod-032', 'Noise-Cancelling Sleepbuds', 'Ultra-comfortable true wireless sleepbuds with soothing sounds naturally masking noise. Alarm function wakes only you.', 179.99, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'),
  ('prod-033', 'Smart Water Bottle', 'Insulated stainless steel water bottle with LED smart sensor glowing to remind you to drink. Syncs hydration levels to your phone.', 69.95, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500&h=500&fit=crop'),
  ('prod-034', 'E-Reader Signature Edition', 'Premium 6.8-inch e-reader with auto-adjusting warm light, 32GB storage, and wireless charging. Waterproof and glare-free display.', 189.99, 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=500&h=500&fit=crop'),
  ('prod-035', 'Mechanical Numpad', 'Wireless mechanical number pad with hot-swappable tactile switches, aluminum top plate, and customizable RGB backlighting.', 49.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop'),
  ('prod-036', 'Wireless Lavalier Mic', 'Compact dual-channel wireless microphone system for creators. Uncompressed audio recording with 200m transmission range.', 249.00, 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&h=500&fit=crop'),
  ('prod-037', 'Smart Body Scale', 'Wi-Fi connected smart scale measuring weight, body fat %, muscle mass, and bone density. Supports multiple users with automatic sync.', 79.99, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&h=500&fit=crop'),
  ('prod-038', 'Streaming Deck', '15 customizable LCD keys for live production. One-touch operation to switch scenes, launch media, and adjust audio on the fly.', 149.99, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop'),
  ('prod-039', 'Curved Monitor Light Bar', 'Asymmetric optical design monitor light bar tailored for curved screens. Adjustable color temperature and auto-dimming.', 99.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'),
  ('prod-040', 'Ergonomic Vertical Mouse', 'Advanced ergonomic vertical mouse that reduces muscle strain, promoting a more natural posture. Features precision tracking.', 89.99, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&h=500&fit=crop'),
  ('prod-041', 'Heavy Duty Tablet Stand', 'Multi-angle adjustable aluminum alloy tablet stand for iPad Pro and drawing tablets. Stable base and anti-slip silicone pads.', 35.99, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop'),
  ('prod-042', 'Smart Plant Sensor', 'Bluetooth plant monitor tracking soil moisture, light, temperature, and fertilizer levels. Extensive database provides plant care tips.', 29.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop'),
  ('prod-043', 'Universal Travel Adapter', '65W GaN universal travel adapter working in over 200 countries. Features multiple USB-C slots and fast-charging support.', 49.99, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop'),
  ('prod-044', 'Mesh Wi-Fi System', 'AX3000 whole home mesh Wi-Fi system covering up to 4500 sq ft. Seamless roaming and connect up to 100 devices simultaneously.', 199.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'),
  ('prod-046', 'Portable Air Compressor', 'Rechargeable digital tire inflator with auto-shutoff and preset pressure modes. Doubles as a power bank and emergency flashlight.', 59.99, 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=500&fit=crop')
ON CONFLICT ("id") DO NOTHING;

-- ─── Create Prisma Migrations Table ─────────────────────────
-- This marks the schema as applied so Prisma doesn't try to migrate
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                  TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "checksum"            TEXT NOT NULL,
  "finished_at"         TIMESTAMPTZ,
  "migration_name"      TEXT NOT NULL,
  "logs"                TEXT,
  "rolled_back_at"      TIMESTAMPTZ,
  "started_at"          TIMESTAMPTZ DEFAULT NOW(),
  "applied_steps_count" INTEGER DEFAULT 0
);
