import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { CartItem } from '@/lib/types';
import { notifyAdmin } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer } = body as { items: CartItem[]; customer: Record<string, string> };
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const db = getDb();

    // Check inventory
    for (const item of items) {
      const product = await db.prepare('SELECT id, name, inventory, active FROM products WHERE id = ?').get(item.product.id) as any;
      if (!product || !product.active) return NextResponse.json({ error: `"${item.product.name}" is no longer available` }, { status: 400 });
      if (product.inventory < item.quantity) return NextResponse.json({ error: `Only ${product.inventory} of "${item.product.name}" available` }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const orderNumber = `UG-${Date.now().toString(36).toUpperCase()}`;
    const result = await db.prepare(`INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, address_line1, address_line2, city, state, postal_code, country, subtotal, shipping, tax, total, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`).run(
      orderNumber, customer.name, customer.email, customer.phone || '', customer.address_line1, customer.address_line2 || '', customer.city, customer.state, customer.postal_code, customer.country || 'US', subtotal, shipping, tax, total
    );
    const orderId = result.lastInsertRowid;

    const insertItem = await db.prepare('INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) VALUES (?,?,?,?,?)');
    const updateInventory = await db.prepare('UPDATE products SET inventory = inventory - ?, updated_at = datetime(\'now\') WHERE id = ?');
    const autoDeactivate = await db.prepare('UPDATE products SET active = 0 WHERE id = ? AND inventory <= 0');
    const checkLow = await db.prepare('SELECT id, name, inventory FROM products WHERE id = ? AND inventory < 10');

    let lowStockItems: string[] = [];
    for (const item of items) {
      insertItem.run(orderId, item.product.id, item.product.name, item.product.price, item.quantity);
      updateInventory.run(item.quantity, item.product.id);
      autoDeactivate.run(item.product.id);
      const low = checkLow.get(item.product.id) as any;
      if (low) lowStockItems.push(`${low.name} (${low.inventory} left)`);
    }

    // Email notifications
    const itemsList = items.map(i => `${i.product.name} x${i.quantity} — $${(i.product.price * i.quantity).toFixed(2)}`).join('<br>');
    await notifyAdmin(`🛒 New Order #${orderNumber} — $${total.toFixed(2)}`,
      `<h3>New Order</h3><p><b>Order:</b> ${orderNumber}</p><p><b>Customer:</b> ${customer.name} (${customer.email})</p><p><b>Address:</b> ${customer.address_line1}, ${customer.city}, ${customer.state}, ${customer.country}</p><p><b>Items:</b><br>${itemsList}</p><p><b>Total:</b> $${total.toFixed(2)}</p>`
    );

    if (lowStockItems.length > 0) {
      await notifyAdmin(`⚠️ Low Stock Alert`,
        `<h3>Low Stock Warning</h3><p>The following items have low inventory:</p><ul>${lowStockItems.map(s => `<li>${s}</li>`).join('')}</ul>`
      );
    }

    // Send order confirmation to customer
    const settings = await db.prepare('SELECT * FROM site_settings').all() as {key:string,value:string}[];
    const getSetting = (k:string,d:string) => { const s = settings.find((x:any)=>x.key===k); return s?.value || d; };
    const subj = getSetting('email_subject','Order Confirmed — {{order_number}}').replace('{{order_number}}',orderNumber).replace('{{customer_name}}',customer.name);
    const heading = getSetting('email_heading','Thank you for your order!');
    const emailBodyText = getSetting('email_body','Your order has been confirmed and will be processed shortly.');
    const footer = getSetting('email_footer','If you have any questions, reply to this email.');
    const itemsTable = items.map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.product.name} × ${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">$${(i.product.price*i.quantity).toFixed(2)}</td></tr>`).join('');
    const customerHtml = `<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif"><div style="background:#000;padding:24px;text-align:center"><span style="color:#fff;font-size:20px;font-weight:700">URBAN<span style="color:#D63F1C">GARAGE</span></span></div><div style="padding:32px 24px;background:#fff"><h1 style="font-size:22px;color:#14140f;margin-bottom:16px">${heading}</h1><p style="font-size:15px;color:#4b5563;line-height:1.6;margin-bottom:24px">${emailBodyText}</p><div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px"><p style="font-weight:700;margin-bottom:12px">Order ${orderNumber}</p><table style="width:100%;border-collapse:collapse">${itemsTable}<tr><td style="padding:12px;font-weight:700">Total</td><td style="padding:12px;text-align:right;font-weight:700;font-size:18px">$${total.toFixed(2)}</td></tr></table></div><a href="${process.env.NEXT_PUBLIC_SITE_URL}/track" style="display:inline-block;background:#D63F1C;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;margin-bottom:24px">Track Your Order</a><p style="font-size:13px;color:#9ca3af;margin-top:24px">${footer}</p></div></div>`;
    const { sendEmail } = await import('@/lib/email');
    await sendEmail(customer.email, subj, customerHtml);

    return NextResponse.json({ orderNumber, orderId });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
