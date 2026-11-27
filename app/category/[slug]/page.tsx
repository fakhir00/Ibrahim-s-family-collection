'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CATEGORY_DESCRIPTIONS, CATEGORY_IMAGES, CATEGORY_SLUGS, ProductCard, StoreShell } from '@/lib/site';
import type { Product } from '@/lib/types';

const SLUGS = ['women', 'men', 'kids', 'abaya'];

export default function CategoryPage() {
  const params = useParams();
  const slug = String(params.slug || '').toLowerCase();
  const category = CATEGORY_SLUGS[slug];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (!category) {
    return (
      <StoreShell>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 16px' }}>
          <h1 style={{ fontSize: 36 }}>Category not found</h1>
          <p style={{ color: '#6b6a7d', marginTop: 8 }}>We have four categories: Women, Men, Kids and Abaya.</p>
          <p style={{ marginTop: 16 }}>
            <Link href="/shop" className="btn btn-navy">Browse the full shop</Link>
          </p>
        </div>
      </StoreShell>
    );
  }

  const list = products.filter((p) => p.category === category);

  return (
    <StoreShell>
      <section style={{ position: 'relative', overflow: 'hidden', background: '#100f2e', color: '#fff' }}>
        <img src={CATEGORY_IMAGES[category]} alt={`${category} clothing`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '48px 16px' }}>
          <span className="gold-label">{category} Collection</span>
          <h1 style={{ fontSize: 44, color: '#fff', marginTop: 12 }}>{category}</h1>
          <p style={{ color: '#cfcfe0', fontSize: 17, marginTop: 8, maxWidth: 640 }}>{CATEGORY_DESCRIPTIONS[category]}</p>
          <p style={{ color: '#f2f35c', fontWeight: 700, marginTop: 12 }}>{list.length} styles · Cash on Delivery</p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 16px 48px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SLUGS.map((s) => (
            <Link key={s} href={`/category/${s}`} className={`chip ${s === slug ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
              {CATEGORY_SLUGS[s]}
            </Link>
          ))}
          <Link href="/shop" className="chip" style={{ textDecoration: 'none', marginLeft: 'auto' }}>Shop All →</Link>
        </div>
        {loading ? (
          <p style={{ marginTop: 24 }}>Loading…</p>
        ) : list.length === 0 ? (
          <p style={{ marginTop: 24 }}>No products in this category yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 20 }}>
            {list.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </StoreShell>
  );
}
