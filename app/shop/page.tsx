'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProductCard, StoreShell } from '@/lib/site';
import type { Product } from '@/lib/types';

const CATEGORIES = ['Women', 'Men', 'Kids', 'Abaya'] as const;

function ShopInner() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(qParam);
  const [category, setCategory] = useState('All');
  const [priceBand, setPriceBand] = useState('All');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      // "Under PKR 999" includes products priced exactly PKR 999 (<=, not <).
      if (priceBand === 'under999' && p.price > 999) return false;
      if (priceBand === 'under1999' && p.price >= 1999) return false;
      if (priceBand === '1999plus' && p.price < 1999) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, priceBand, search, sort]);

  return (
    <div>
      <section style={{ background: '#100f2e', color: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 16px' }}>
          <span className="gold-label">Ibrahim&rsquo;s Family Collection</span>
          <h1 style={{ fontSize: 42, color: '#fff', marginTop: 12 }}>Shop All</h1>
          <p style={{ color: '#cfcfe0', fontSize: 17, marginTop: 8, maxWidth: 640 }}>
            The full collection — women, men, kids and abaya. Cash on Delivery across Pakistan,
            delivery PKR 250, free on orders over PKR 5,000.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field"
            style={{ flex: 1, minWidth: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suits, kurtas, abayas, kids wear…"
            aria-label="Search products"
          />
          <select className="field" style={{ width: 'auto' }} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="field" style={{ width: 'auto' }} value={priceBand} onChange={(e) => setPriceBand(e.target.value)} aria-label="Filter by price">
            <option value="All">All prices</option>
            <option value="under999">Under PKR 999</option>
            <option value="under1999">Under PKR 1,999</option>
            <option value="1999plus">PKR 1,999 and above</option>
          </select>
          <select className="field" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
          <span style={{ marginLeft: 'auto', color: '#6b6a7d', fontSize: 14 }}>{filtered.length} product{filtered.length === 1 ? '' : 's'}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <Link href="/shop" className={`chip ${category === 'All' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>All</Link>
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/category/${c.toLowerCase()}`} className="chip" style={{ textDecoration: 'none' }}>{c}</Link>
          ))}
        </div>

        {loading ? (
          <p style={{ marginTop: 24 }}>Loading the collection…</p>
        ) : filtered.length === 0 ? (
          <p style={{ marginTop: 24 }}>No products match — try a different filter or search.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 20 }}>
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <StoreShell>
      <Suspense fallback={<p style={{ padding: 32 }}>Loading the shop…</p>}>
        <ShopInner />
      </Suspense>
    </StoreShell>
  );
}
