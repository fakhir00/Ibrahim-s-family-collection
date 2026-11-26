'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LOGO_DATA_URI } from '@/lib/logo-data';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, formatPKR } from '@/lib/types';
import type { Order, Product, Settings } from '@/lib/types';

/* ---------- small SVG icon set (no text glyphs) ---------- */
function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const ICONS = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  bag: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  truck: 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  cash: 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20M6 15h4',
};

function initials(name: string): string {
  return name
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function ProductImage({ product, height = 260 }: { product: Product; height?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed || !product.image) {
    return (
      <div
        style={{
          height,
          background: '#100f2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f2f35c',
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        {initials(product.name)}
      </div>
    );
  }
  return (
    <img
      src={product.image}
      alt={product.name}
      style={{ width: '100%', height, objectFit: 'cover' }}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function discountPct(p: Product): number {
  if (!p.compareAt || p.compareAt <= p.price) return 0;
  return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
}

interface CartLine {
  product: Product;
  size: string;
  colour: string;
  qty: number;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Women: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80&auto=format&fit=crop',
  Men: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80&auto=format&fit=crop',
  Kids: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&auto=format&fit=crop',
  Abaya: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80&auto=format&fit=crop',
};

const TICKER_ITEMS = [
  'Winter Sale — up to 30% off selected styles',
  'Cash on Delivery available across Pakistan',
  'Free delivery on orders over PKR 5,000',
  'Easy 7-day exchange in store',
  'Visit us: ABC Road, Near Ideal Bakery, Faisalabad',
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [priceBand, setPriceBand] = useState<string>('All');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [qvSize, setQvSize] = useState('');
  const [qvColour, setQvColour] = useState('');
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ customer: '', phone: '', address: '', city: '' });
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([ps, st]) => {
        setProducts(ps);
        setSettings(st);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    try {
      const saved = localStorage.getItem('ifc_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ifc_wishlist', JSON.stringify(wishlist));
    } catch { /* ignore */ }
  }, [wishlist]);

  const maxDiscount = useMemo(() => {
    const ds = products.map(discountPct);
    return ds.length ? Math.max(...ds) : 0;
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (priceBand === 'under999' && p.price >= 999) return false;
      if (priceBand === 'under1999' && p.price >= 1999) return false;
      if (priceBand === '1999plus' && p.price < 1999) return false;
      if (showWishlistOnly && !wishlist.includes(p.id)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, category, priceBand, search, showWishlistOnly, wishlist]);

  const under999 = products.filter((p) => p.price < 999);
  const under1999 = products.filter((p) => p.price >= 999 && p.price < 1999);

  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = cart.reduce((n, l) => n + l.product.price * l.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  function toggleWishlist(id: string) {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  }

  function addToCart(product: Product, size?: string, colour?: string) {
    const s = size || product.sizes[0] || 'One Size';
    const c = colour || product.colours[0] || '';
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.product.id === product.id && l.size === s && l.colour === c);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { product, size: s, colour: c, qty: 1 }];
    });
  }

  function setQty(index: number, qty: number) {
    setCart((prev) =>
      qty <= 0 ? prev.filter((_, i) => i !== index) : prev.map((l, i) => (i === index ? { ...l, qty } : l)),
    );
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.customer.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setFormError('Please fill in your name, phone, address and city.');
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart.map((l) => ({ productId: l.product.id, qty: l.qty, size: l.size, colour: l.colour })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place order');
      const order = data as Order;
      // Mirror into browser localStorage so the owner sees orders in this
      // browser even if the server instance recycles (see README).
      try {
        const existing: Order[] = JSON.parse(localStorage.getItem('ifc_orders') || '[]');
        localStorage.setItem('ifc_orders', JSON.stringify([order, ...existing]));
      } catch { /* ignore */ }
      setPlacedOrder(order);
      setCart([]);
      setCheckout(false);
      setDrawerOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  function openQuickView(p: Product) {
    setQuickView(p);
    setQvSize(p.sizes[0] || 'One Size');
    setQvColour(p.colours[0] || '');
  }

  const categories = ['Women', 'Men', 'Kids', 'Abaya'] as const;

  return (
    <div>
      {/* Announcement bar */}
      <div style={{ background: '#100f2e', color: '#f2f35c', textAlign: 'center', padding: '8px 12px', fontSize: 13, fontWeight: 700, letterSpacing: '.04em', borderBottom: '2px dashed #c9a227' }}>
        Winter Sale is on — up to {maxDiscount}% off selected styles &nbsp;·&nbsp; Cash on Delivery across Pakistan
      </div>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e8e6df', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <span style={{ background: '#100f2e', borderRadius: 10, padding: 5, display: 'inline-flex', border: '1px dashed #c9a227', outline: '1px solid #efe9d6', outlineOffset: 2 }}>
              <img src={LOGO_DATA_URI} alt="Ibrahim's Family Collection logo" width={46} height={46} style={{ borderRadius: 6 }} />
            </span>
            <span>
              <span className="serif" style={{ display: 'block', fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>
                Ibrahim&rsquo;s Family Collection
              </span>
              <span style={{ display: 'block', fontSize: 12, color: '#6b6a7d' }}>Family clothing · Faisalabad · Since 2015</span>
            </span>
          </Link>

          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', border: '1.5px solid #e8e6df', borderRadius: 999, padding: '8px 14px', gap: 8 }}>
            <span style={{ color: '#100f2e', display: 'inline-flex' }}><Icon d={ICONS.search} size={18} /></span>
            <input
              aria-label="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suits, kurtas, abayas, kids wear…"
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 15, background: 'transparent' }}
            />
          </div>

          <button
            className="btn btn-ghost"
            style={{ padding: '9px 14px' }}
            onClick={() => { setShowWishlistOnly((v) => !v); setCategory('All'); setPriceBand('All'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}
            aria-label="View wishlist"
          >
            <Icon d={ICONS.heart} size={18} /> Wishlist ({wishlist.length})
          </button>
          <button className="btn btn-navy" style={{ padding: '9px 16px' }} onClick={() => setDrawerOpen(true)} aria-label="Open shopping bag">
            <Icon d={ICONS.bag} size={18} /> Bag ({cartCount})
          </button>
          <Link href="/admin" style={{ fontSize: 14, fontWeight: 700, color: '#100f2e' }}>Admin</Link>
        </div>
        <nav style={{ maxWidth: 1180, margin: '0 auto', padding: '0 16px 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`chip ${category === 'All' ? 'active' : ''}`} onClick={() => setCategory('All')}>All</button>
          {categories.map((c) => (
            <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section className="hero-grid" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 16px 28px' }}>
        <div>
          <span className="gold-label">Winter Collection · Faisalabad</span>
          <h1 className="hero-title" style={{ fontSize: 56, lineHeight: 1.05, marginTop: 14 }}>
            Cozy. Simple. <span style={{ borderBottom: '4px dashed #c9a227' }}>Winter.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#6b6a7d', lineHeight: 1.6, maxWidth: 520 }}>
            Warm, honest family clothing for Men, Women, Kids and Abaya — stitched with
            care, priced for the whole family. Shop online, pay cash on delivery.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <a className="btn btn-navy" href="#shop">Shop the Collection</a>
            <a className="btn btn-gold" href="#under999">Best Buys Under PKR 999</a>
          </div>
          <p style={{ fontSize: 13, color: '#6b6a7d', marginTop: 14 }}>
            Free delivery on orders over PKR 5,000 · Delivery PKR 250 otherwise · Easy 7-day exchange in store
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <div className="stitch-frame">
            <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1000&q=80&auto=format&fit=crop" alt="Winter clothing rail" style={{ width: '100%', height: 340, objectFit: 'cover', borderRadius: 10 }} />
          </div>
          <span className="sale-tag" style={{ position: 'absolute', top: 18, right: 18, fontSize: 16, padding: '8px 14px' }}>
            Winter Sale — up to {maxDiscount}% off
          </span>
          <span className="gold-label" style={{ position: 'absolute', bottom: 18, left: 18 }}>Since 2015 · ABC Road, Faisalabad</span>
        </div>
      </section>

      {/* Ticker */}
      <div style={{ background: '#f2f35c', borderTop: '2px dashed #c9a227', borderBottom: '2px dashed #c9a227', overflow: 'hidden', padding: '9px 0', fontWeight: 700, color: '#100f2e', fontSize: 14 }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i}>{t} ·</span>
          ))}
        </div>
      </div>

      {/* Perks */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { icon: ICONS.truck, title: 'Nationwide Delivery', text: 'We deliver all across Pakistan' },
          { icon: ICONS.cash, title: 'Cash on Delivery', text: 'Pay when your order arrives' },
          { icon: ICONS.refresh, title: 'Easy Exchange', text: '7-day exchange in store' },
          { icon: ICONS.shield, title: 'Quality Checked', text: 'Every piece checked before packing' },
        ].map((p) => (
          <div key={p.title} className="stitch" style={{ borderRadius: 12, padding: 16, background: '#fff', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ color: '#c9a227', display: 'inline-flex' }}><Icon d={p.icon} size={24} /></span>
            <span><strong style={{ display: 'block', color: '#100f2e' }}>{p.title}</strong><span style={{ fontSize: 13, color: '#6b6a7d' }}>{p.text}</span></span>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 16px 28px' }}>
        <h2 style={{ fontSize: 30 }}>Shop by Category</h2>
        <p style={{ color: '#6b6a7d', marginTop: 6 }}>One store for the whole family — pick a category to start.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 18 }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setShowWishlistOnly(false); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ textAlign: 'left', padding: 0, background: 'none', border: 'none' }}
            >
              <div className="stitch-frame card" style={{ padding: 6 }}>
                <img src={CATEGORY_IMAGES[c]} alt={c + ' clothing'} style={{ width: '100%', height: 190, objectFit: 'cover', borderRadius: 10 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px 8px' }}>
                  <span className="serif" style={{ fontSize: 20, fontWeight: 700 }}>{c}</span>
                  <span className="gold-label">{products.filter((p) => p.category === c).length} styles</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Under 999 */}
      <section id="under999" className="weave" style={{ borderTop: '1px solid #e8e6df', borderBottom: '1px solid #e8e6df' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 30 }}>Best Buys Under PKR 999</h2>
            <span className="gold-label">Small prices · Big warmth</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
            {under999.map((p) => <ProductCard key={p.id} product={p} onQuickView={openQuickView} onAdd={addToCart} wished={wishlist.includes(p.id)} onToggleWish={toggleWishlist} />)}
          </div>
        </div>
      </section>

      {/* Under 1999 */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 30 }}>Style Steals Under PKR 1,999</h2>
          <span className="gold-label">Everyday favourites</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
          {under1999.map((p) => <ProductCard key={p.id} product={p} onQuickView={openQuickView} onAdd={addToCart} wished={wishlist.includes(p.id)} onToggleWish={toggleWishlist} />)}
        </div>
      </section>

      {/* Full grid + filters */}
      <section id="shop" className="weave" style={{ borderTop: '1px solid #e8e6df' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 16px 48px' }}>
          <h2 style={{ fontSize: 30 }}>{showWishlistOnly ? 'Your Wishlist' : 'The Full Collection'}</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
            <select className="field" style={{ width: 'auto' }} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
              <option value="All">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="field" style={{ width: 'auto' }} value={priceBand} onChange={(e) => setPriceBand(e.target.value)} aria-label="Filter by price">
              <option value="All">All prices</option>
              <option value="under999">Under PKR 999</option>
              <option value="under1999">Under PKR 1,999</option>
              <option value="1999plus">PKR 1,999 and above</option>
            </select>
            {showWishlistOnly && <button className="chip" onClick={() => setShowWishlistOnly(false)}>Show all products</button>}
            <span style={{ marginLeft: 'auto', color: '#6b6a7d', fontSize: 14 }}>{filtered.length} product{filtered.length === 1 ? '' : 's'}</span>
          </div>
          {loading ? (
            <p style={{ marginTop: 24 }}>Loading the collection…</p>
          ) : filtered.length === 0 ? (
            <p style={{ marginTop: 24 }}>No products match — try a different filter or search.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
              {filtered.map((p) => <ProductCard key={p.id} product={p} onQuickView={openQuickView} onAdd={addToCart} wished={wishlist.includes(p.id)} onToggleWish={toggleWishlist} />)}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '2px dashed #c9a227' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: '#100f2e', borderRadius: 10, padding: 5, display: 'inline-flex', border: '1px dashed #c9a227', outline: '1px solid #efe9d6', outlineOffset: 2 }}>
                <img src={LOGO_DATA_URI} alt="Ibrahim's Family Collection logo" width={42} height={42} style={{ borderRadius: 6 }} />
              </span>
              <span className="serif" style={{ fontSize: 19, fontWeight: 700 }}>Ibrahim&rsquo;s Family Collection</span>
            </div>
            <p style={{ color: '#6b6a7d', lineHeight: 1.6, fontSize: 14 }}>
              Family clothing for Men, Women, Kids and Abaya — serving Faisalabad since 2015.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 17, marginBottom: 10 }}>Visit the Store</h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#6b6a7d', margin: 0 }}>
              {settings?.address || 'ABC Road, Near Ideal Bakery, Gulfishan Colony, Faisalabad, Pakistan'}
              <br />{settings?.hours || '10:00 AM to 8:00 PM Mon–Sat, closed Sundays'}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 17, marginBottom: 10 }}>Get in Touch</h3>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: '#6b6a7d', margin: 0 }}>
              Phone: <a href="tel:03210066789">{settings?.phone || '0321-0066789'}</a><br />
              Email: <a href="mailto:info@ibrahimsfc.com">{settings?.email || 'info@ibrahimsfc.com'}</a><br />
              {settings?.facebook ? <a href={settings.facebook} target="_blank" rel="noreferrer">Facebook — 2,580 followers</a> : null}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 17, marginBottom: 10 }}>Shopping</h3>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: '#6b6a7d', margin: 0 }}>
              Cash on Delivery across Pakistan<br />
              Delivery PKR 250 · Free over PKR 5,000<br />
              Easy 7-day exchange in store
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px dashed #c9a227', textAlign: 'center', padding: '14px 16px', fontSize: 13, color: '#6b6a7d' }}>
          © {new Date().getFullYear()} Ibrahim&rsquo;s Family Collection · ibrahimsfc.com · Stitched with care in Faisalabad
        </div>
      </footer>

      {/* Bag drawer */}
      {drawerOpen && (
        <>
          <div className="overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="drawer" aria-label="Shopping bag">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #e8e6df' }}>
              <h2 style={{ fontSize: 22 }}>Your Bag ({cartCount})</h2>
              <button className="btn btn-ghost" style={{ padding: '8px 10px' }} onClick={() => setDrawerOpen(false)} aria-label="Close bag"><Icon d={ICONS.x} size={18} /></button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {cart.length === 0 ? (
                <p style={{ color: '#6b6a7d' }}>Your bag is empty. Add something cosy from the collection.</p>
              ) : (
                cart.map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, borderBottom: '1px dashed #e8e6df', paddingBottom: 14 }}>
                    <div style={{ width: 72, flexShrink: 0 }}><ProductImage product={line.product} height={84} /></div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 14 }}>{line.product.name}</strong>
                      <div style={{ fontSize: 13, color: '#6b6a7d' }}>{line.size}{line.colour ? ` · ${line.colour}` : ''}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <span>
                          <button className="chip" style={{ padding: '3px 10px' }} onClick={() => setQty(i, line.qty - 1)} aria-label="Decrease quantity">−</button>
                          <span style={{ margin: '0 8px', fontWeight: 700 }}>{line.qty}</span>
                          <button className="chip" style={{ padding: '3px 10px' }} onClick={() => setQty(i, line.qty + 1)} aria-label="Increase quantity">+</button>
                        </span>
                        <strong>{formatPKR(line.product.price * line.qty)}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {cart.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 15, lineHeight: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{formatPKR(subtotal)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery {subtotal >= FREE_DELIVERY_THRESHOLD ? '(free over PKR 5,000)' : ''}</span>
                    <strong>{delivery === 0 ? 'FREE' : formatPKR(delivery)}</strong>
                  </div>
                  {subtotal < FREE_DELIVERY_THRESHOLD && (
                    <div style={{ fontSize: 13, color: '#6b6a7d' }}>Add {formatPKR(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #c9a227', marginTop: 8, paddingTop: 8 }}>
                    <span>Total</span><strong style={{ fontSize: 18 }}>{formatPKR(total)}</strong>
                  </div>
                </div>
              )}
            </div>
            {cart.length > 0 && !checkout && (
              <div style={{ padding: 20, borderTop: '1px solid #e8e6df' }}>
                <button className="btn btn-navy" style={{ width: '100%' }} onClick={() => setCheckout(true)}>Checkout — Cash on Delivery</button>
              </div>
            )}
            {cart.length > 0 && checkout && (
              <form onSubmit={placeOrder} style={{ padding: 20, borderTop: '1px solid #e8e6df', display: 'grid', gap: 10 }}>
                <h3 style={{ fontSize: 18 }}>Cash on Delivery</h3>
                <div><label className="lbl" htmlFor="co-name">Full name</label><input id="co-name" className="field" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Your full name" /></div>
                <div><label className="lbl" htmlFor="co-phone">Phone</label><input id="co-phone" className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX-XXXXXXX" /></div>
                <div><label className="lbl" htmlFor="co-address">Delivery address</label><textarea id="co-address" className="field" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, street, area" /></div>
                <div><label className="lbl" htmlFor="co-city">City</label><input id="co-city" className="field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Faisalabad" /></div>
                <p style={{ fontSize: 13, color: '#6b6a7d', margin: 0 }}>Pay in cash when your order arrives. Delivery {formatPKR(DELIVERY_FEE)} — free on orders over {formatPKR(FREE_DELIVERY_THRESHOLD)}.</p>
                {formError && <p style={{ color: '#c03128', fontSize: 14, margin: 0 }}>{formError}</p>}
                <button className="btn btn-gold" type="submit" disabled={placing}>{placing ? 'Placing order…' : `Place Order — ${formatPKR(total)}`}</button>
                <button className="btn btn-ghost" type="button" onClick={() => setCheckout(false)}>Back to bag</button>
              </form>
            )}
          </aside>
        </>
      )}

      {/* Quick view */}
      {quickView && (
        <>
          <div className="overlay" onClick={() => setQuickView(null)} />
          <div className="modal-wrap">
            <div className="modal">
              <div className="qv-grid">
                <ProductImage product={quickView} height={420} />
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="gold-label">{quickView.category}</span>
                    <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => setQuickView(null)} aria-label="Close quick view"><Icon d={ICONS.x} size={16} /></button>
                  </div>
                  <h2 style={{ fontSize: 26, marginTop: 12 }}>{quickView.name}</h2>
                  <p style={{ marginTop: 8 }}>
                    <strong style={{ fontSize: 22 }}>{formatPKR(quickView.price)}</strong>
                    {quickView.compareAt && (
                      <span style={{ marginLeft: 10, color: '#6b6a7d' }}><s>{formatPKR(quickView.compareAt)}</s> <span className="sale-tag" style={{ marginLeft: 6 }}>-{discountPct(quickView)}%</span></span>
                    )}
                  </p>
                  <p style={{ color: '#6b6a7d', lineHeight: 1.6 }}>{quickView.description}</p>
                  <div style={{ marginTop: 14 }}>
                    <label className="lbl">Size</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {quickView.sizes.map((s) => (
                        <button key={s} className={`chip ${qvSize === s ? 'active' : ''}`} onClick={() => setQvSize(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                  {quickView.colours.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <label className="lbl">Colour</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {quickView.colours.map((c) => (
                          <button key={c} className={`chip ${qvColour === c ? 'active' : ''}`} onClick={() => setQvColour(c)}>{c}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: quickView.stock > 0 ? '#2e7d32' : '#c03128', marginTop: 14 }}>
                    {quickView.stock > 0 ? `${quickView.stock} in stock` : 'Out of stock'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-navy"
                      disabled={quickView.stock <= 0}
                      onClick={() => { addToCart(quickView, qvSize, qvColour); setQuickView(null); setDrawerOpen(true); }}
                    >
                      <Icon d={ICONS.bag} size={18} /> Add to Bag
                    </button>
                    <button className="btn btn-ghost" onClick={() => toggleWishlist(quickView.id)}>
                      <Icon d={ICONS.heart} size={18} /> {wishlist.includes(quickView.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order success */}
      {placedOrder && (
        <>
          <div className="overlay" />
          <div className="modal-wrap">
            <div className="modal" style={{ maxWidth: 520, padding: 32, textAlign: 'center' }}>
              <span style={{ display: 'inline-flex', color: '#2e7d32', background: '#e8f5e9', borderRadius: '50%', padding: 14 }}><Icon d={ICONS.check} size={32} /></span>
              <h2 style={{ fontSize: 28, marginTop: 14 }}>Order placed — thank you!</h2>
              <p style={{ color: '#6b6a7d', lineHeight: 1.6 }}>
                Your order <strong style={{ color: '#100f2e' }}>{placedOrder.id}</strong> is confirmed.
                Please keep <strong style={{ color: '#100f2e' }}>{formatPKR(placedOrder.total)}</strong> ready —
                you will pay in cash when it arrives.
              </p>
              <div className="stitch" style={{ borderRadius: 12, padding: 16, textAlign: 'left', marginTop: 16, fontSize: 14, lineHeight: 1.9 }}>
                <div><strong>Order:</strong> {placedOrder.id}</div>
                <div><strong>Name:</strong> {placedOrder.customer}</div>
                <div><strong>Phone:</strong> {placedOrder.phone}</div>
                <div><strong>Deliver to:</strong> {placedOrder.address}, {placedOrder.city}</div>
                <div><strong>Items:</strong> {placedOrder.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</div>
                <div><strong>Subtotal:</strong> {formatPKR(placedOrder.subtotal)}</div>
                <div><strong>Delivery:</strong> {placedOrder.delivery === 0 ? 'FREE' : formatPKR(placedOrder.delivery)}</div>
                <div><strong>Total (COD):</strong> {formatPKR(placedOrder.total)}</div>
              </div>
              <p style={{ fontSize: 13, color: '#6b6a7d', marginTop: 14 }}>
                Questions? Call {settings?.phone || '0321-0066789'} (10 AM–8 PM, Mon–Sat).
              </p>
              <button className="btn btn-navy" style={{ marginTop: 8 }} onClick={() => setPlacedOrder(null)}>Continue Shopping</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onQuickView,
  onAdd,
  wished,
  onToggleWish,
}: {
  product: Product;
  onQuickView: (p: Product) => void;
  onAdd: (p: Product) => void;
  wished: boolean;
  onToggleWish: (id: string) => void;
}) {
  const pct = discountPct(product);
  return (
    <article className="card">
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => onQuickView(product)}>
        <div className="stitch-frame" style={{ border: 'none', padding: 0, borderRadius: 0 }}>
          <ProductImage product={product} height={260} />
        </div>
        {pct > 0 && <span className="sale-tag" style={{ position: 'absolute', top: 12, left: 12 }}>-{pct}%</span>}
        {product.badge && <span className="gold-label" style={{ position: 'absolute', top: 12, right: 12 }}>{product.badge}</span>}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, color: '#6b6a7d', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>{product.category}</div>
        <h3 style={{ fontSize: 18, marginTop: 4, cursor: 'pointer' }} onClick={() => onQuickView(product)}>{product.name}</h3>
        <p style={{ margin: '8px 0 0' }}>
          <strong style={{ fontSize: 18 }}>{formatPKR(product.price)}</strong>
          {product.compareAt && <span style={{ marginLeft: 8, color: '#6b6a7d', fontSize: 14 }}><s>{formatPKR(product.compareAt)}</s></span>}
        </p>
        <p style={{ fontSize: 13, color: '#6b6a7d', margin: '6px 0 0' }}>
          Sizes: {product.sizes.join(', ')} · {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="btn btn-navy" style={{ flex: 1, padding: '10px 12px' }} disabled={product.stock <= 0} onClick={() => onAdd(product)}>
            <Icon d={ICONS.bag} size={16} /> Add to Bag
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: '10px 12px', color: wished ? '#c03128' : '#100f2e', borderColor: wished ? '#c03128' : '#100f2e' }}
            onClick={() => onToggleWish(product.id)}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Icon d={ICONS.heart} size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
