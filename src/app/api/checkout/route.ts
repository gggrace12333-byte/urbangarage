import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { CartItem } from '@/lib/types';
import { notifyAdmin } from '@/lib/email';
import crypto from 'crypto';

// Idempotency cache to prevent duplicate orders
const processedTokens = new Set<string>();

function generateOrderNumber(): string {
  // Format: UG-XXXXXX where X is alphanumeric, non-sequential
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `UG-${rand}${ts}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Origin/referer check — only allow same-site requests
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (process.env.NODE_ENV === "production" && origin && !origin.startsWith(siteUrl) && !referer.startsWith(siteUrl)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const { items, customer, idempotencyToken } = body as { items: CartItem[]; customer: Record<string, string>; idempotencyToken?: string };

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    // Idempotency check — prevent duplicate submissions
    if (idempotencyToken) {
      if (processedTokens.has(idempotencyToken)) {
        return NextResponse.json({ error: 'Order already processed' }, { status: 409 });
      }
      processedTokens.add(idempotencyToken);
      // Clean old tokens after 30 minutes
      setTimeout(() => processedTokens.delete(idempotencyToken), 30 * 60 * 1000);
    }

    // Validate required customer fields
    if (!customer.name?.trim() || !customer.email?.trim() || !customer.address_line1?.trim()) {
      return NextResponse.json({ error: 'Name, email, and address are required' }, { status: 400 });
    }

    const db = getDb();

    // Check inventory and active status
    for (const item of items) {
      const product = db.prepare('SELECT id, name, price, compare_at_price, inventory, active FROM products WHERE id = ?').get(item.product.id) as any;
      if (!product || !product.active) {
        return NextResponse.json({ error: `"${item.product.name}" is no longer available` }, { status: 400 });
      }
      if (product.inventory < item.quantity) {
        return NextResponse.json({ error: `Only ${product.inventory} of "${item.product.name}" available` }, { status: 400 });
      }

      // Server-side price validation — prevent client-side price tampering
      const expectedPrice = item.sku_price || item.product.price;
      let serverPrice = product.price;
      if (item.sku_value) {
        const variant = db.prepare("SELECT price FROM product_variants WHERE product_id = ? AND value = ?").get(item.product.id, item.sku_value) as any;
        if (variant) serverPrice = variant.price;
      }
      if (Math.abs(expectedPrice - serverPrice) > 0.01) {
        return NextResponse.json({ error: `"Price mismatch for \"${item.product.name}\". Please refresh and try again.` }, { status: 400 });
      }
      // End price validation
    }

    const subtotal = items.reduce((sum, item) => sum + (item.sku_price || item.product.price) * item.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const orderNumber = generateOrderNumber();

    // Use a transaction to ensure atomicity
    // PostgreSQL transaction
    let orderId = 0;
    await db.transaction(async (exec) => {
      const r = await exec('INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, address_line1, address_line2, city, state, postal_code, country, subtotal, shipping, tax, total, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,\'pending\')',
        [orderNumber, customer.name.trim(), customer.email.trim().toLowerCase(), customer.phone || '', customer.address_line1.trim(), customer.address_line2 || '', customer.city || '', customer.state || '', customer.postal_code || '', customer.country || 'US', subtotal, shipping, tax, total]);
      orderId = r.lastInsertRowid;
      for (const item of items) {
        await exec('INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) VALUES (?,?,?,?,?)',
          [orderId, item.product.id, (item.sku_name || item.product.name), (item.sku_price || item.product.price), item.quantity]);
        await exec('UPDATE products SET inventory = inventory - ?, updated_at = NOW() WHERE id = ?', [item.quantity, item.product.id]);
        await exec('UPDATE products SET active = 0 WHERE id = ? AND inventory <= 0', [item.product.id]);
      }
    });

    const checkLow = db.prepare('SELECT id, name, inventory FROM products WHERE id = ? AND inventory < 10');

    // Post-order actions (outside transaction, non-critical)
    const lowStockItems: string[] = [];
    for (const item of items) {
      const low = await checkLow.get(item.product.id) as any;
      if (low) lowStockItems.push(`${low.name} (${low.inventory} left)`);
    }

    // Admin notification
    const itemsList = items.map(i => `${(i.sku_name || i.product.name)} x${i.quantity} — $${((i.sku_price || i.product.price) * i.quantity).toFixed(2)}`).join('<br>');
    notifyAdmin(`New Order #${orderNumber} — $${total.toFixed(2)}`,
      `<h3>New Order</h3><p><b>Order:</b> ${orderNumber}</p><p><b>Customer:</b> ${customer.name} (${customer.email})</p><p><b>Address:</b> ${customer.address_line1}, ${customer.city}, ${customer.state}, ${customer.country}</p><p><b>Items:</b><br>${itemsList}</p><p><b>Total:</b> $${total.toFixed(2)}</p>`
    );

    if (lowStockItems.length > 0) {
      notifyAdmin('Low Stock Alert',
        `<h3>Low Stock Warning</h3><p>The following items have low inventory:</p><ul>${lowStockItems.map(s => `<li>${s}</li>`).join('')}</ul>`
      );
    }

    // Customer confirmation email
    const settings = await db.prepare('SELECT * FROM site_settings').all() as {key:string,value:string}[];
    const getSetting = (k:string,d:string) => { const s = settings.find((x:any)=>x.key===k); return s?.value || d; };
    const subj = getSetting('email_subject','Order Confirmed — {{order_number}}').replace('{{order_number}}',orderNumber).replace('{{customer_name}}',customer.name);
    const heading = getSetting('email_heading','Thank you for your order!');
    const emailBodyText = getSetting('email_body','Your order has been confirmed and will be processed shortly.');
    const footer = getSetting('email_footer','If you have any questions, reply to this email.');
    const itemsTable = items.map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${(i.sku_name || i.product.name)} &times; ${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">$${((i.sku_price || i.product.price)*i.quantity).toFixed(2)}</td></tr>`).join('');
    const customerHtml = `<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#000;padding:24px;text-align:center"><span style="color:#fff;font-size:20px;font-weight:700">URBAN<span style="color:#D63F1C">GARAGE</span></span></div><div style="padding:32px 24px;background:#fff"><h1 style="font-size:22px;color:#14140f;margin-bottom:16px">${heading}</h1><p style="font-size:15px;color:#4b5563;line-height:1.6;margin-bottom:24px">${emailBodyText}</p><div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px"><p style="font-weight:700;margin-bottom:12px">Order ${orderNumber}</p><table style="width:100%;border-collapse:collapse">${itemsTable}<tr><td style="padding:12px;font-weight:700">Total</td><td style="padding:12px;text-align:right;font-weight:700;font-size:18px">$${total.toFixed(2)}</td></tr></table></div><a href="${process.env.NEXT_PUBLIC_SITE_URL}/track" style="display:inline-block;background:#D63F1C;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;margin-bottom:24px">Track Your Order</a><p style="font-size:13px;color:#9ca3af;margin-top:24px">${footer}</p></div></div>`;
    const { sendEmail } = await import('@/lib/email');
    sendEmail(customer.email.trim().toLowerCase(), subj, customerHtml).catch(() => {});

    return NextResponse.json({ orderNumber });
  } catch (error) {
    // Log errors server-side only in production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      // Checkout error handled via 500 response
    }
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 });
  }
}
