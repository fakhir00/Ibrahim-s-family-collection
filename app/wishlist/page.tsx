'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard, StoreShell, useShop } from '@/lib/site';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const { wishlist } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <StoreShell>
      <section style={{ background: '#100f2e', color: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 16px' }}>
          <span className="gold-label">Saved for later</span>
          <h1 style={{ fontSize: 42, color: '#fff', marginTop: 12 }}>Your Wishlist</h1>
          <p style={{ color: '#cfcfe0', fontSize: 16, marginTop: 8 }}>
            {saved.length} item{saved.length === 1 ? '' : 's'} saved · Saved on this device, so you can come back to them any time.
          </p>
        </div>
      </section>
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 16px 48px' }}>
        {loading ? (
          <p>Loading your wishlist…</p>
        ) : saved.length === 0 ? (
          <div>
            <p style={{ color: '#6b6a7d', lineHeight: 1.7 }}>
              Your wishlist is empty. Tap the heart on any product to save it here.
            </p>
            <p style={{ marginTop: 16 }}>
              <Link href="/shop" className="btn btn-navy">Browse the shop</Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {saved.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </StoreShell>
  );
}
