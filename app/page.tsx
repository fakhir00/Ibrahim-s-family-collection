'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CATEGORY_IMAGES, ProductCard, StoreShell, discountPct } from '@/lib/site';
import type { Product, Settings } from '@/lib/types';

const CATEGORIES = ['Women', 'Men', 'Kids', 'Abaya'] as const;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const maxDiscount = useMemo(() => {
    const ds = products.map(discountPct);
    return ds.length ? Math.max(...ds) : 0;
  }, [products]);

  // "Under PKR 999" includes products priced exactly PKR 999 (<=, not <).
  const under999 = products.filter((p) => p.price <= 999);
  const under1999 = products.filter((p) => p.price >= 999 && p.price < 1999);
  const newArrivals = products.filter((p) => p.badge === 'New').slice(0, 8);

  return (
    <StoreShell>
      {/* Hero — full-bleed background photo, white card on the left */}
      <section className="hero-full">
        <img
          src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=2000&q=85&auto=format&fit=crop"
          alt="Woman in a winter dress — Ibrahim's Family Collection"
          className="hero-full-bg"
        />
        <span style={{ position: 'absolute', top: 28, right: 28, zIndex: 2, transform: 'rotate(6deg)', background: '#c03128', color: '#fff', padding: '10px 18px', borderRadius: 6, fontWeight: 800, fontSize: 15, lineHeight: 1.25, textAlign: 'center', boxShadow: '0 8px 20px rgba(16,15,46,.30)' }}>
          WINTER SALE<br />Up to {maxDiscount || 33}% OFF
        </span>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '64px 16px', minHeight: 620, display: 'flex', alignItems: 'center' }}>
          <div className="hero-card">
            <span className="gold-label">Winter Collection · Faisalabad</span>
            <h1 className="hero-title" style={{ fontSize: 56, lineHeight: 1.05, marginTop: 16 }}>
              Cozy. Simple. <span style={{ borderBottom: '4px dashed #c9a227' }}>Winter.</span>
            </h1>
            <p style={{ fontSize: 18, color: '#4a4860', lineHeight: 1.6, marginTop: 14 }}>
              Quality clothing for the whole family — women, men and kids — at prices that
              respect your budget. Serving families since 2015.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
              <Link className="btn btn-gold" href="/shop">SHOP NOW</Link>
              <a className="btn btn-ghost" href="#under1999" style={{ border: '1.5px dashed #100f2e' }}>STYLE STEALS UNDER 1,999</a>
            </div>
            <p style={{ fontSize: 13, color: '#6b6a7d', marginTop: 16 }}>
              Free delivery on orders over PKR 5,000 · Delivery PKR 250 otherwise · Easy 7-day exchange in store
            </p>
          </div>
        </div>
      </section>

      {/* Yellow scrolling ticker */}
      <div style={{ background: '#f2f35c', color: '#100f2e', overflow: 'hidden', padding: '10px 0', fontWeight: 700, fontSize: 14, letterSpacing: '.04em' }}>
        <span className="ticker-track">
          {'STYLE STEALS UNDER PKR 1,999 \u00b7 EASY SIZE EXCHANGE AT OUR FAISALABAD STORE \u00b7 NEW WINTER ARRIVALS \u2014 KHADDAR & FLEECE \u00b7 FREE DELIVERY OVER PKR 5,000 \u00b7 '.repeat(2)}
        </span>
      </div>

      {/* Perks */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { title: 'Nationwide Delivery', text: 'We deliver all across Pakistan' },
          { title: 'Cash on Delivery', text: 'Pay when your order arrives' },
          { title: 'Easy Exchange', text: '7-day exchange in store' },
          { title: 'Quality Checked', text: 'Every piece checked before packing' },
        ].map((p) => (
          <div key={p.title} style={{ border: '1px solid #e8e6df', borderRadius: 12, padding: 16, background: '#fff' }}>
            <strong style={{ display: 'block', color: '#100f2e' }}>{p.title}</strong>
            <span style={{ fontSize: 13, color: '#6b6a7d' }}>{p.text}</span>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 16px 28px' }}>
        <h2 style={{ fontSize: 30 }}>Shop by Category</h2>
        <p style={{ color: '#6b6a7d', marginTop: 6 }}>One store for the whole family — pick a category to start.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 18 }}>
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/category/${c.toLowerCase()}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 0 }}>
                <img src={CATEGORY_IMAGES[c]} alt={c + ' clothing'} style={{ width: '100%', height: 190, objectFit: 'cover' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                  <span className="serif" style={{ fontSize: 20, fontWeight: 700 }}>{c}</span>
                  <span className="gold-label">{products.filter((p) => p.category === c).length} styles</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Winter Arrivals */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 16px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 30 }}>New Winter Arrivals</h2>
          <Link href="/shop" style={{ fontWeight: 700, fontSize: 14 }}>View all {products.length} products →</Link>
        </div>
        {loading ? (
          <p style={{ marginTop: 18 }}>Loading the collection…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Under 999 */}
      <section id="under999" className="weave" style={{ borderTop: '1px solid #e8e6df', borderBottom: '1px solid #e8e6df' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 30 }}>Best Buys Under PKR 999</h2>
            <span className="gold-label">Small prices · Big warmth</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
            {under999.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Under 1999 */}
      <section id="under1999" style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 30 }}>Style Steals Under PKR 1,999</h2>
          <span className="gold-label">Everyday favourites</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
          {under1999.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Shop-all call to action */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '0 16px 48px' }}>
        <div style={{ background: '#100f2e', borderRadius: 16, padding: '32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 28, color: '#fff' }}>The Full Collection — {products.length} products</h2>
            <p style={{ color: '#cfcfe0', marginTop: 6 }}>
              Women, men, kids and abaya — search, filter by price and sort. Cash on Delivery across Pakistan.
            </p>
          </div>
          <Link href="/shop" className="btn btn-gold">Browse All Products</Link>
        </div>
        <p style={{ fontSize: 13, color: '#6b6a7d', marginTop: 16, textAlign: 'center' }}>
          {settings?.address || 'ABC Road, Near Ideal Bakery, Faisalabad'} · {settings?.phone || '0321-0066789'} · {settings?.hours || '10:00 AM to 8:00 PM Mon–Sat, closed Sundays'}
        </p>
      </section>
    </StoreShell>
  );
}
