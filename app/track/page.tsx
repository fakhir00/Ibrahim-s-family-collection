'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { StoreShell } from '@/lib/site';
import { formatPKR } from '@/lib/types';
import type { Order } from '@/lib/types';

function TrackInner() {
  const searchParams = useSearchParams();
  const [id, setId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState('');

  async function lookup(orderId: string) {
    const clean = orderId.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your order ID (for example IFC-ABC123).');
      return;
    }
    setLooking(true);
    setError('');
    setSearched(false);
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`);
      if (res.ok) {
        setOrder(await res.json());
        setSearched(true);
        setLooking(false);
        return;
      }
    } catch { /* fall through to local mirror */ }
    try {
      const local: Order[] = JSON.parse(localStorage.getItem('ifc_orders') || '[]');
      const found = local.find((o) => o.id.toUpperCase() === clean);
      if (found) {
        setOrder(found);
        setSearched(true);
        setLooking(false);
        return;
      }
    } catch { /* ignore */ }
    setSearched(true);
    setLooking(false);
  }

  useEffect(() => {
    const preset = searchParams.get('id');
    if (preset) lookup(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const stepIndex = order ? (order.status === 'Cancelled' ? -1 : steps.indexOf(order.status)) : -1;

  return (
    <div>
      <section style={{ background: '#100f2e', color: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 16px' }}>
          <span className="gold-label">Cash on Delivery</span>
          <h1 style={{ fontSize: 42, color: '#fff', marginTop: 12 }}>Track Your Order</h1>
          <p style={{ color: '#cfcfe0', fontSize: 16, marginTop: 8 }}>
            Enter the order ID from your confirmation — it looks like IFC-ABC123.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 16px 48px' }}>
        <form
          className="card"
          style={{ maxWidth: 640, padding: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}
          onSubmit={(e) => { e.preventDefault(); lookup(id); }}
        >
          <input
            className="field"
            style={{ flex: 1, minWidth: 200, textTransform: 'uppercase' }}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="IFC-XXXXXX"
            aria-label="Order ID"
          />
          <button className="btn btn-navy" type="submit" disabled={looking}>{looking ? 'Looking…' : 'Track Order'}</button>
        </form>
        {error && <p style={{ color: '#c03128', marginTop: 12 }}>{error}</p>}

        {searched && !order && (
          <div className="card" style={{ maxWidth: 640, padding: 24, marginTop: 16 }}>
            <h2 style={{ fontSize: 22 }}>Order not found</h2>
            <p style={{ color: '#6b6a7d', lineHeight: 1.7, marginTop: 8 }}>
              We could not find an order with ID <strong style={{ color: '#100f2e' }}>{id.trim().toUpperCase()}</strong>.
              Please check the ID and try again. If you placed the order in a different browser,
              it may only be visible on the device you ordered from — and orders can be lost
              if the store&rsquo;s server restarted, because no permanent database is connected yet.
            </p>
            <p style={{ marginTop: 12, fontSize: 14, color: '#6b6a7d' }}>
              Need help? Call 0321-0066789 (10 AM–8 PM, Mon–Sat).
            </p>
          </div>
        )}

        {order && (
          <div className="card" style={{ maxWidth: 640, padding: 24, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22 }}>{order.id}</h2>
              <span className="sale-tag" style={{ background: order.status === 'Cancelled' ? '#6b6a7d' : order.status === 'Delivered' ? '#100f2e' : '#c03128' }}>
                {order.status}
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#6b6a7d', marginTop: 6 }}>
              Placed {new Date(order.createdAt).toLocaleString('en-PK')} · {order.customer} · {order.city}
            </p>
            {order.status !== 'Cancelled' && (
              <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                {steps.map((s, i) => (
                  <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: 8, borderRadius: 999, background: i <= stepIndex ? '#f2f35c' : '#e8e6df' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: i <= stepIndex ? '#100f2e' : '#6b6a7d' }}>{s}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 18, fontSize: 14, lineHeight: 1.9 }}>
              {order.items.map((i) => (
                <div key={i.productId + i.size + i.colour} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>{i.name} ({i.size}{i.colour ? `, ${i.colour}` : ''}) × {i.qty}</span>
                  <strong>{formatPKR(i.price * i.qty)}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e8e6df', marginTop: 10, paddingTop: 10 }}>
                <span>Delivery</span><strong>{order.delivery === 0 ? 'FREE' : formatPKR(order.delivery)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total (COD)</span><strong>{formatPKR(order.total)}</strong>
              </div>
              <div style={{ color: '#6b6a7d', marginTop: 8 }}>Deliver to: {order.address}, {order.city}</div>
            </div>
            <p style={{ marginTop: 16 }}>
              <Link href="/shop" className="btn btn-ghost">Continue Shopping</Link>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function TrackPage() {
  return (
    <StoreShell>
      <Suspense fallback={<p style={{ padding: 32 }}>Loading…</p>}>
        <TrackInner />
      </Suspense>
    </StoreShell>
  );
}
