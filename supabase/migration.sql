-- Supabase Migration: Urban Garage
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL,
  compare_at_price REAL,
  images JSONB DEFAULT '[]',
  description_images JSONB DEFAULT '[]',
  category_id BIGINT REFERENCES categories(id),
  tags TEXT DEFAULT '',
  sku TEXT DEFAULT '',
  featured INTEGER DEFAULT 0,
  inventory INTEGER DEFAULT 100,
  active INTEGER DEFAULT 1,
  spec_dimensions TEXT DEFAULT '',
  spec_scale TEXT DEFAULT '',
  spec_power TEXT DEFAULT '',
  spec_lighting TEXT DEFAULT '',
  features TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants / SKUs
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT DEFAULT '',
  price_adjustment REAL DEFAULT 0,
  inventory INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  image TEXT DEFAULT '',
  price REAL DEFAULT 0,
  compare_at_price REAL,
  images JSONB DEFAULT '[]'
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id BIGINT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  subtotal REAL NOT NULL,
  shipping REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  tracking_number TEXT DEFAULT '',
  tracking_url TEXT DEFAULT '',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  product_name TEXT NOT NULL,
  product_price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  image TEXT DEFAULT '',
  link TEXT DEFAULT '',
  button_text TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT DEFAULT '',
  reply TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  country TEXT DEFAULT 'Unknown',
  page TEXT DEFAULT '',
  value REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- Seed Data

-- Admin user (password: 411319)
INSERT INTO users (name, email, password) VALUES ('admin', 'admin@urbangarage.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9') ON CONFLICT (email) DO NOTHING;

-- Categories
INSERT INTO categories (name, slug, sort_order) VALUES 
  ('Parking Garage', 'parking-garage', 1),
  ('Diorama', 'diorama', 2)
ON CONFLICT DO NOTHING;

-- Site Settings
INSERT INTO site_settings (key, value) VALUES
  ('hero_badge', 'SERIES 01 · 2026'),
  ('hero_title', 'FOR THE CARS\nYOU''VE KEPT'),
  ('hero_subtitle', 'DriftPad for Hot Wheels · Drift Pad for 1:64 Scale'),
  ('hero_desc', 'A motorized display that spins your 1:64 miniature cars in a continuous drift loop — right on your desk.'),
  ('hero_cta', 'Shop the DriftPad'),
  ('hero_cta_link', '/products'),
  ('hero_cta2', 'How it works'),
  ('hero_cta2_link', '#how-it-works'),
  ('hero_bg_image', '/products/collection-bg.jpg'),
  ('how_title', 'How Drift Pad works'),
  ('how_desc', 'A motorized display that spins your 1:64 miniature cars in a continuous drift loop — right on your desk.'),
  ('story_text', 'We make things that work better and last longer. Our products solve real problems with clean design and honest materials.'),
  ('story_founder', 'FOUNDER · URBAN GARAGE'),
  ('marquee_text', 'DRIFTPAD FOR HOT WHEELS ★ 1:64 SCALE ★ MOTORIZED DISPLAY ★ SMOOTH 360° DRIFTING ★'),
  ('featured_title', 'DriftPad for Hot Wheels'),
  ('featured_subtitle', 'Premium motorised drifting display for 1:64 diecast collectors'),
  ('social_instagram', 'https://instagram.com'),
  ('social_youtube', 'https://youtube.com'),
  ('social_facebook', 'https://facebook.com'),
  ('contact_email', 'support@urbantrackgarage.com'),
  ('policy_privacy', 'Urban Garage is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.'),
  ('policy_terms', 'By accessing and placing an order with Urban Garage, you confirm that you are in agreement with and bound by the terms and conditions below.'),
  ('policy_shipping', 'We offer free shipping on all US orders over $50. Orders under $50 are charged a flat rate of $5.99.'),
  ('policy_refunds', 'We offer a 30-day money back guarantee. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.')
ON CONFLICT (key) DO NOTHING;

-- Banner
INSERT INTO banners (title, subtitle, image, link, button_text, sort_order, active) VALUES
  ('SERIES 01 · 2026', 'FOR THE CARS YOU''VE KEPT', '/products/collection-bg.jpg', '/products', 'Shop the DriftPad', 1, 1);
