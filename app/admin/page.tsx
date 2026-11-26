'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LOGO_DATA_URI } from '@/lib/logo-data';
import { formatPKR } from '@/lib/types';
import type { Order, OrderStatus, Product, Settings } from '@/lib/types';

type Tab = 'dashboard' | 'products' | 'orders' | 'customers' | 'settings';

const STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  compareAt: undefined,
  category: 'Women',
  sizes: ['One Size'],
  colours: [],
  stock: 0,
  image: '',
  badge: '',
  description: '',
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [settingsForm, setSettingsForm] = useState<Settings | null>(null);
  const [savedNote, setSavedNote] = useState('');

  async function refresh() {
    try {
      const [ps, os, st] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ]);
      setProducts(ps);
      // Merge API orders with the browser mirror (localStorage `ifc_orders`),
      // deduped by order id — so orders placed in this browser still show
      // even if the server instance recycled.
      let local: Order[] = [];
      try {
        local = JSON.parse(localStorage.getItem('ifc_orders') || '[]');
      } catch { /* ignore */ }
      const seen = new Set<string>();
      const merged = [...(os as Order[]), ...local].filter((o) => {
        if (seen.has(o.id)) return false;
        seen.add(o.id);
        return true;
      });
      setOrders(merged);
      setSettings(st);
      setSettingsForm(st);
    } catch {
      setError('Could not load admin data. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revenue = useMemo(
    () => orders.filter((o) => o.status !== 'Cancelled').reduce((n, o) => n + o.total, 0),
    [orders],
  );
  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; orders: number; spent: number }>();
    for (const o of orders) {
      const key = o.phone || o.customer;
      const cur = map.get(key) || { name: o.customer, phone: o.phone, orders: 0, spent: 0 };
      cur.orders += 1;
      cur.spent += o.status === 'Cancelled' ? 0 : o.total;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/products/${editing.id}` : '/api/products';
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError('Could not save product.');
      return;
    }
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    refresh();
  }

  async function deleteProduct(id: string) {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    refresh();
  }

  async function setOrderStatus(order: Order, status: OrderStatus) {
    // Update the server copy when it exists; always update the browser mirror.
    await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => undefined);
    try {
      const local: Order[] = JSON.parse(localStorage.getItem('ifc_orders') || '[]');
      localStorage.setItem(
        'ifc_orders',
        JSON.stringify(local.map((o) => (o.id === order.id ? { ...o, status } : o))),
      );
    } catch { /* ignore */ }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settingsForm) return;
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsForm),
    });
    if (res.ok) {
      setSettings(settingsForm);
      setSavedNote('Settings saved.');
      setTimeout(() => setSavedNote(''), 3000);
    } else {
      setError('Could not save settings.');
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f2' }}>
      <header style={{ background: '#fff', borderBottom: '2px dashed #c9a227' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ background: '#100f2e', borderRadius: 10, padding: 5, display: 'inline-flex', border: '1px dashed #c9a227', outline: '1px solid #efe9d6', outlineOffset: 2 }}>
            <img src={LOGO_DATA_URI} alt="Ibrahim's Family Collection logo" width={42} height={42} style={{ borderRadius: 6 }} />
          </span>
          <div>
            <h1 style={{ fontSize: 22 }}>Admin — {settings?.storeName || "Ibrahim's Family Collection"}</h1>
            <div style={{ fontSize: 13, color: '#6b6a7d' }}>Store owner panel · {settings?.phone || '0321-0066789'}</div>
          </div>
          <Link href="/" className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '9px 16px' }}>View Store</Link>
        </div>
        <nav style={{ maxWidth: 1180, margin: '0 auto', padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} className={`chip ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.id === 'orders' && orders.length > 0 ? ` (${orders.length})` : ''}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 16px 48px' }}>
        <p style={{ fontSize: 13, color: '#6b6a7d', background: '#fff', border: '1px dashed #c9a227', borderRadius: 10, padding: '10px 14px' }}>
          Note: this store has no external database yet. Orders and product edits are kept in the
          server&rsquo;s memory (and mirrored in this browser), so they survive within a warm
          instance but can be lost if the server restarts. See README.md for the upgrade path
          (Vercel Postgres / KV with a DATABASE_URL).
        </p>
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: '#c03128' }}>{error}</p>}

        {!loading && tab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Revenue', value: formatPKR(revenue) },
                { label: 'Orders', value: String(orders.length) },
                { label: 'Products', value: String(products.length) },
                { label: 'Customers', value: String(customers.length) },
              ].map((s) => (
                <div key={s.label} className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, color: '#6b6a7d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
                  <div className="serif" style={{ fontSize: 30, marginTop: 6 }}>{s.value}</div>
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: 24, marginTop: 28 }}>Recent Orders</h2>
            {orders.length === 0 ? (
              <p style={{ color: '#6b6a7d' }}>No orders yet. Orders placed on the storefront will appear here.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {orders.slice(0, 8).map((o) => (
                  <div key={o.id} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <span><strong>{o.id}</strong> · {o.customer} · {o.items.length} item{o.items.length === 1 ? '' : 's'}</span>
                    <span><strong>{formatPKR(o.total)}</strong> · {o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'products' && (
          <div>
            <h2 style={{ fontSize: 24 }}>Products ({products.length})</h2>
            <form onSubmit={saveProduct} className="card" style={{ padding: 20, marginTop: 14, display: 'grid', gap: 12 }}>
              <h3 style={{ fontSize: 18 }}>{editing ? `Edit: ${editing.name}` : 'Add a Product'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div><label className="lbl">Name</label><input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div><label className="lbl">Price (PKR)</label><input className="field" type="number" min={0} value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required /></div>
                <div><label className="lbl">Compare-at price (PKR, optional)</label><input className="field" type="number" min={0} value={form.compareAt || ''} onChange={(e) => setForm({ ...form, compareAt: e.target.value ? Number(e.target.value) : undefined })} /></div>
                <div>
                  <label className="lbl">Category</label>
                  <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}>
                    {(['Women', 'Men', 'Kids', 'Abaya'] as const).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Sizes (comma separated)</label><input className="field" value={form.sizes.join(', ')} onChange={(e) => setForm({ ...form, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>
                <div><label className="lbl">Colours (comma separated)</label><input className="field" value={form.colours.join(', ')} onChange={(e) => setForm({ ...form, colours: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>
                <div><label className="lbl">Stock</label><input className="field" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div><label className="lbl">Image URL</label><input className="field" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></div>
                <div><label className="lbl">Badge (optional)</label><input className="field" value={form.badge || ''} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Winter Sale" /></div>
              </div>
              <div><label className="lbl">Description</label><textarea className="field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-navy" type="submit">{editing ? 'Save Changes' : 'Add Product'}</button>
                {editing && <button className="btn btn-ghost" type="button" onClick={() => { setEditing(null); setForm(EMPTY_PRODUCT); }}>Cancel</button>}
              </div>
            </form>
            <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
              {products.map((p) => (
                <div key={p.id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span><strong>{p.name}</strong> · {p.category} · {formatPKR(p.price)}{p.compareAt ? ` (was ${formatPKR(p.compareAt)})` : ''} · Stock {p.stock}</span>
                  <span style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost" style={{ padding: '7px 12px' }} onClick={() => { setEditing(p); setForm({ ...p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                    <button className="btn btn-red" style={{ padding: '7px 12px' }} onClick={() => deleteProduct(p.id)}>Delete</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && tab === 'orders' && (
          <div>
            <h2 style={{ fontSize: 24 }}>Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <p style={{ color: '#6b6a7d', marginTop: 12 }}>No orders yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                {orders.map((o) => (
                  <div key={o.id} className="card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <strong>{o.id}</strong>
                      <span>{new Date(o.createdAt).toLocaleString('en-PK')}</span>
                      <strong>{formatPKR(o.total)}</strong>
                    </div>
                    <div style={{ fontSize: 14, color: '#6b6a7d', marginTop: 6, lineHeight: 1.7 }}>
                      {o.customer} · {o.phone}<br />
                      {o.address}, {o.city}<br />
                      {o.items.map((i) => `${i.name} (${i.size}${i.colour ? ', ' + i.colour : ''}) × ${i.qty}`).join(' · ')}
                      <br />Subtotal {formatPKR(o.subtotal)} + Delivery {o.delivery === 0 ? 'FREE' : formatPKR(o.delivery)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                      <label className="lbl" style={{ margin: 0 }}>Status:</label>
                      <select className="field" style={{ width: 'auto' }} value={o.status} onChange={(e) => setOrderStatus(o, e.target.value as OrderStatus)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'customers' && (
          <div>
            <h2 style={{ fontSize: 24 }}>Customers ({customers.length})</h2>
            <p style={{ color: '#6b6a7d', fontSize: 14 }}>Derived from orders — no separate customer accounts on this store.</p>
            {customers.length === 0 ? (
              <p style={{ color: '#6b6a7d' }}>No customers yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                {customers.map((c) => (
                  <div key={c.phone} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <span><strong>{c.name}</strong> · {c.phone}</span>
                    <span>{c.orders} order{c.orders === 1 ? '' : 's'} · {formatPKR(c.spent)} spent</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'settings' && settingsForm && (
          <div>
            <h2 style={{ fontSize: 24 }}>Store Settings</h2>
            <form onSubmit={saveSettings} className="card" style={{ padding: 20, marginTop: 14, display: 'grid', gap: 12, maxWidth: 640 }}>
              {(
                [
                  ['storeName', 'Store name'],
                  ['phone', 'Phone'],
                  ['email', 'Email'],
                  ['address', 'Address'],
                  ['hours', 'Hours'],
                  ['facebook', 'Facebook URL'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="lbl">{label}</label>
                  <input className="field" value={settingsForm[key]} onChange={(e) => setSettingsForm({ ...settingsForm, [key]: e.target.value })} />
                </div>
              ))}
              {(
                [
                  ['instagram', 'Instagram URL'],
                  ['youtube', 'YouTube URL'],
                  ['tiktok', 'TikTok URL'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="lbl">{label}</label>
                  <input
                    className="field"
                    value={settingsForm[key]}
                    placeholder="Add your official link"
                    onChange={(e) => setSettingsForm({ ...settingsForm, [key]: e.target.value })}
                  />
                </div>
              ))}
              <p style={{ fontSize: 13, color: '#6b6a7d', margin: 0 }}>
                Instagram, YouTube and TikTok are intentionally blank — no official accounts have
                been verified for this brand. Add links here only once they are confirmed.
              </p>
              <div>
                <button className="btn btn-navy" type="submit">Save Settings</button>
                {savedNote && <span style={{ marginLeft: 12, color: '#2e7d32', fontWeight: 700 }}>{savedNote}</span>}
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
