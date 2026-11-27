'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ICONS, Icon, StoreShell, useShop } from '@/lib/site';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, formatPKR } from '@/lib/types';
import type { Order } from '@/lib/types';

export default function CheckoutPage() {
  const { cart, subtotal, delivery, total, clearCart } = useShop();
  const [form, setForm] = useState({ customer: '', phone: '', address: '', city: '' });
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.customer.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setFormError('Please fill in your name, phone, address and city.');
      return;
    }
    if (cart.length === 0) {
      setFormError('Your bag is empty — add something first.');
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart.map((l) => ({ productId: l.productId, qty: l.qty, size: l.size, colour: l.colour })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place order');
      const order = data as Order;
      // Mirror into browser localStorage so the owner sees the order in this
      // browser even if the server instance recycles (see README).
      try {
        const existing: Order[] = JSON.parse(localStorage.getItem('ifc_orders') || '[]');
        localStorage.setItem('ifc_orders', JSON.stringify([order, ...existing]));
      } catch { /* ignore */ }
      setPlacedOrder(order);
      clearCart();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <StoreShell>
      <section style={{ background: '#100f2e', color: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 16px' }}>
          <span className="gold-label">Cash on Delivery</span>
          <h1 style={{ fontSize: 42, color: '#fff', marginTop: 12 }}>Checkout</h1>
          <p style={{ color: '#cfcfe0', fontSize: 16, marginTop: 8 }}>Pay in cash when your order arrives. No online payment needed.</p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 16px 48px' }}>
        {placedOrder ? (
          <div className="card" style={{ maxWidth: 640, margin: '0 auto', padding: 32, textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', color: '#100f2e', background: '#f4efe6', borderRadius: '50%', padding: 14 }}>
              <Icon d={ICONS.check} size={32} />
            </span>
            <h2 style={{ fontSize: 28, marginTop: 14 }}>Order placed — thank you!</h2>
            <p style={{ color: '#6b6a7d', lineHeight: 1.7 }}>
              Your order <strong style={{ color: '#100f2e' }}>{placedOrder.id}</strong> is confirmed.
              Please keep <strong style={{ color: '#100f2e' }}>{formatPKR(placedOrder.total)}</strong> ready —
              you will pay in cash when it arrives.
            </p>
            <div style={{ border: '1px solid #e8e6df', borderRadius: 12, padding: 16, textAlign: 'left', marginTop: 16, fontSize: 14, lineHeight: 1.9 }}>
              <div><strong>Order:</strong> {placedOrder.id}</div>
              <div><strong>Name:</strong> {placedOrder.customer}</div>
              <div><strong>Phone:</strong> {placedOrder.phone}</div>
              <div><strong>Deliver to:</strong> {placedOrder.address}, {placedOrder.city}</div>
              <div><strong>Items:</strong> {placedOrder.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</div>
              <div><strong>Subtotal:</strong> {formatPKR(placedOrder.subtotal)}</div>
              <div><strong>Delivery:</strong> {placedOrder.delivery === 0 ? 'FREE' : formatPKR(placedOrder.delivery)}</div>
              <div><strong>Total (COD):</strong> {formatPKR(placedOrder.total)}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              <Link href={`/track?id=${placedOrder.id}`} className="btn btn-navy">Track This Order</Link>
              <Link href="/shop" className="btn btn-ghost">Continue Shopping</Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ color: '#6b6a7d', lineHeight: 1.7 }}>Your bag is empty — there is nothing to check out yet.</p>
            <p style={{ marginTop: 16 }}>
              <Link href="/shop" className="btn btn-navy">Browse the shop</Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
            <form onSubmit={placeOrder} className="card" style={{ padding: 24, display: 'grid', gap: 12 }}>
              <h2 style={{ fontSize: 24 }}>Delivery Details</h2>
              <div><label className="lbl" htmlFor="ck-name">Full name</label><input id="ck-name" className="field" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Your full name" /></div>
              <div><label className="lbl" htmlFor="ck-phone">Phone</label><input id="ck-phone" className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX-XXXXXXX" /></div>
              <div><label className="lbl" htmlFor="ck-address">Delivery address</label><textarea id="ck-address" className="field" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, street, area" /></div>
              <div><label className="lbl" htmlFor="ck-city">City</label><input id="ck-city" className="field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Faisalabad" /></div>
              <p style={{ fontSize: 13, color: '#6b6a7d', margin: 0 }}>
                Cash on Delivery only. Delivery {formatPKR(DELIVERY_FEE)} — free on orders over {formatPKR(FREE_DELIVERY_THRESHOLD)}.
              </p>
              {formError && <p style={{ color: '#c03128', fontSize: 14, margin: 0 }}>{formError}</p>}
              <button className="btn btn-gold" type="submit" disabled={placing}>{placing ? 'Placing order…' : `Place Order — ${formatPKR(total)}`}</button>
            </form>

            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 24 }}>Order Summary</h2>
              <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                {cart.map((line, i) => (
                  <div key={`${line.productId}-${line.size}-${line.colour}-${i}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {line.image && <img src={line.image} alt={line.name} style={{ width: 56, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
                    <div style={{ flex: 1 }}>
                      <Link href={`/product/${line.productId}`} style={{ fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>{line.name}</Link>
                      <div style={{ fontSize: 13, color: '#6b6a7d' }}>{line.size}{line.colour ? ` · ${line.colour}` : ''} · × {line.qty}</div>
                    </div>
                    <strong>{formatPKR(line.price * line.qty)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, fontSize: 15, lineHeight: 2, borderTop: '1px solid #e8e6df', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{formatPKR(subtotal)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery</span><strong>{delivery === 0 ? 'FREE' : formatPKR(delivery)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #100f2e', marginTop: 8, paddingTop: 8 }}>
                  <span>Total (COD)</span><strong style={{ fontSize: 18 }}>{formatPKR(total)}</strong>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#6b6a7d', marginTop: 12 }}>
                Questions? Call 0321-0066789 (10 AM–8 PM, Mon–Sat).
              </p>
            </div>
          </div>
        )}
      </section>
    </StoreShell>
  );
}
