'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ICONS, Icon, ProductCard, ProductImage, StoreShell, discountPct, useShop } from '@/lib/site';
import { formatPKR } from '@/lib/types';
import type { Product } from '@/lib/types';

export default function ProductPage() {
  const params = useParams();
  const id = String(params.id || '');
  const { addToCart, toggleWishlist, wishlist, setDrawerOpen } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('');
  const [colour, setColour] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((ps: Product[]) => {
        setProducts(ps);
        const found = ps.find((p) => p.id === id);
        if (found) {
          setSize(found.sizes[0] || 'One Size');
          setColour(found.colours[0] || '');
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [id]);

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const related = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [products, product],
  );

  if (loading) {
    return (
      <StoreShell>
        <p style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 16px' }}>Loading product…</p>
      </StoreShell>
    );
  }

  if (!product) {
    return (
      <StoreShell>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 16px' }}>
          <h1 style={{ fontSize: 36 }}>Product not found</h1>
          <p style={{ color: '#6b6a7d', marginTop: 8 }}>This product may have been removed from the collection.</p>
          <p style={{ marginTop: 16 }}>
            <Link href="/shop" className="btn btn-navy">Browse the full shop</Link>
          </p>
        </div>
      </StoreShell>
    );
  }

  const pct = discountPct(product);
  const wished = wishlist.includes(product.id);

  return (
    <StoreShell>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 16px 48px' }}>
        <p style={{ fontSize: 14, color: '#6b6a7d', margin: 0 }}>
          <Link href="/">Home</Link> &nbsp;›&nbsp; <Link href="/shop">Shop</Link> &nbsp;›&nbsp;{' '}
          <Link href={`/category/${product.category.toLowerCase()}`}>{product.category}</Link> &nbsp;›&nbsp; {product.name}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginTop: 20 }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e8e6df' }}>
            <ProductImage product={product} height={520} />
          </div>
          <div>
            <span className="gold-label">{product.category}</span>
            {product.badge && <span className="gold-label" style={{ marginLeft: 8 }}>{product.badge}</span>}
            <h1 style={{ fontSize: 36, marginTop: 12 }}>{product.name}</h1>
            <p style={{ marginTop: 10 }}>
              <strong style={{ fontSize: 26 }}>{formatPKR(product.price)}</strong>
              {product.compareAt && (
                <span style={{ marginLeft: 10, color: '#6b6a7d' }}>
                  <s>{formatPKR(product.compareAt)}</s>{' '}
                  <span className="sale-tag" style={{ marginLeft: 6 }}>-{pct}%</span>
                </span>
              )}
            </p>
            <p style={{ color: '#6b6a7d', lineHeight: 1.7 }}>{product.description}</p>

            <div style={{ marginTop: 18 }}>
              <label className="lbl">Size</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.sizes.map((s) => (
                  <button key={s} className={`chip ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>
            {product.colours.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <label className="lbl">Colour</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colours.map((c) => (
                    <button key={c} className={`chip ${colour === c ? 'active' : ''}`} onClick={() => setColour(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}
            <p style={{ fontSize: 14, color: product.stock > 0 ? '#100f2e' : '#c03128', marginTop: 16, fontWeight: 700 }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <button className="chip" style={{ padding: '8px 12px' }} onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Decrease quantity">−</button>
                <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                <button className="chip" style={{ padding: '8px 12px' }} onClick={() => setQty((n) => Math.min(product.stock, n + 1))} aria-label="Increase quantity">+</button>
              </span>
              <button
                className="btn btn-navy"
                disabled={product.stock <= 0}
                onClick={() => { addToCart(product, size, colour, qty); setDrawerOpen(true); }}
              >
                <Icon d={ICONS.bag} size={18} /> Add to Bag
              </button>
              <button className="btn btn-ghost" onClick={() => toggleWishlist(product.id)}>
                <Icon d={ICONS.heart} size={18} /> {wished ? 'Saved in Wishlist' : 'Save to Wishlist'}
              </button>
            </div>

            <div style={{ border: '1px solid #e8e6df', borderRadius: 12, padding: 16, marginTop: 20, fontSize: 14, lineHeight: 1.9, color: '#6b6a7d' }}>
              <strong style={{ color: '#100f2e' }}>Cash on Delivery</strong> — pay when your order arrives.<br />
              Delivery PKR 250 · Free on orders over PKR 5,000<br />
              7-day exchange in store · Every piece quality-checked before packing
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 28 }}>You may also like — {product.category}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </StoreShell>
  );
}
