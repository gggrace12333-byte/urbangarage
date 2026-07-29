'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/lib/types';

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const load = () => fetch('/api/admin/orders').then(r => r.json()).then(setOrders);
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    load();
  };

  const addTracking = async (id: number) => {
    if (!trackingInput) return;
    await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, tracking_number: trackingInput, tracking_url: 'https://www.yuntoupost.com/track?num=' + trackingInput, status: 'shipped' }) });
    setTrackingInput('');
    load();
  };

  const statusColor = (s: string) => {
    switch (s) { case 'paid': return 'bg-green-500/10 text-green-500'; case 'shipped': return 'bg-blue-500/10 text-blue-500'; case 'delivered': return 'bg-purple-500/10 text-purple-500'; case 'cancelled': return 'bg-red-500/10 text-red-500'; default: return 'bg-yellow-500/10 text-yellow-500'; }
  };

  return (
    <div>
      <div style={{marginBottom:20,display:'flex',gap:8}}><span style={{color:'#646970',fontSize:13}}>{orders.length} orders</span></div>

      {orders.length === 0 ? (
        <div className="wp-card"><p style={{color:'#646970',textAlign:'center',padding:40}}>No orders yet.</p></div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order.id} className="wp-card" style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',cursor:'pointer'}} onClick={()=>setExpanded(expanded===order.id?null:order.id)}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <code style={{fontWeight:600}}>{order.order_number}</code>
                    <span className={`wp-badge badge-${order.status}`}>{order.status}</span>
                    {order.tracking_number && <span style={{fontSize:11,color:'#646970'}}>📦 {order.tracking_number}</span>}
                  </div>
                  <div style={{color:'#646970',fontSize:13}}>{order.customer_name} · {order.customer_email}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:18,fontWeight:700}}>${order.total.toFixed(2)}</div>
                  <div style={{color:'#646970',fontSize:12}}>{new Date(order.created_at).toLocaleString()}</div>
                </div>
              </div>

              {expanded === order.id && (
                <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid #dcdcde'}}>
                  <div style={{marginBottom:16}}>
                    <strong style={{fontSize:13}}>Shipping Address</strong>
                    <p style={{color:'#646970',fontSize:13,marginTop:4}}>
                      {order.address_line1}<br/>{order.city}, {order.state} {order.postal_code}<br/>{order.country}
                    </p>
                  </div>

                  <div style={{marginBottom:16}}>
                    <strong style={{fontSize:13}}>Items</strong>
                    <table className="wp-table" style={{marginTop:8}}>
                      <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
                      <tbody>{order.items?.map((item,i)=><tr key={i}><td>{item.product_name}</td><td>${item.product_price.toFixed(2)}</td><td>{item.quantity}</td><td>${(item.product_price*item.quantity).toFixed(2)}</td></tr>)}</tbody>
                    </table>
                  </div>

                  <div style={{marginBottom:16,fontSize:13}}>
                    <div>Subtotal: ${order.subtotal.toFixed(2)}</div>
                    <div>Shipping: ${order.shipping.toFixed(2)}</div>
                    <div>Tax: ${order.tax.toFixed(2)}</div>
                    <div style={{fontWeight:700,marginTop:4}}>Total: ${order.total.toFixed(2)}</div>
                  </div>

                  {/* Tracking */}
                  <div style={{marginBottom:12,padding:'12px 16px',background:'#f9fafb',borderRadius:6}}>
                    <strong style={{fontSize:13}}>Tracking</strong>
                    {order.tracking_number ? (
                      <div style={{marginTop:8}}>
                        <span style={{fontSize:13}}>📦 {order.tracking_number}</span>
                        {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noopener" style={{display:'block',color:'#2271b1',fontSize:12,marginTop:4}}>View Tracking →</a>}
                      </div>
                    ) : (
                      <div style={{display:'flex',gap:8,marginTop:8}}>
                        <input value={trackingInput} onChange={e=>setTrackingInput(e.target.value)} placeholder="Enter tracking number" style={{flex:1,padding:'8px 12px',fontSize:13}} />
                        <button onClick={()=>addTracking(order.id)} className="wp-btn wp-btn-primary" style={{fontSize:12}}>Add & Mark Shipped</button>
                      </div>
                    )}
                  </div>

                  {/* Status actions */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div style={{display:'flex',gap:8}}>
                      {order.status === 'pending' && <button onClick={()=>updateStatus(order.id,'paid')} className="wp-btn wp-btn-primary">Mark Paid</button>}
                      {order.status === 'paid' && <button onClick={()=>updateStatus(order.id,'shipped')} className="wp-btn wp-btn-primary">Mark Shipped</button>}
                      {order.status === 'shipped' && <button onClick={()=>updateStatus(order.id,'delivered')} className="wp-btn wp-btn-primary">Mark Delivered</button>}
                      <button onClick={()=>updateStatus(order.id,'cancelled')} className="wp-btn wp-btn-outline" style={{color:'#b32d2e'}}>Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
