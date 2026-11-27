'use client';

/**
 * Shared storefront shell for Ibrahim's Family Collection.
 *
 * ShopProvider (cart + wishlist, persisted to localStorage) lives in the root
 * layout so state survives client-side navigation between pages. Every
 * storefront page renders <StoreShell> (slim navy header + extensive footer
 * + bag drawer) around its own content. The admin panel does NOT use this
 * shell — it has its own header.
 *
 * Brand: navy #100f2e / yellow #f2f35c / red #c03128 only. Cropped wide logo,
 * bare on navy, no duplicate name text next to it.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LOGO_WIDE_DATA_URI } from '@/lib/logo-data';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, formatPKR } from '@/lib/types';
import type { Order, Product, Settings } from '@/lib/types';

/* ---------------- icons ---------------- */
export function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
export const ICONS = {
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

/* ---------------- helpers ---------------- */
export function discountPct(p: Product): number {
  if (!p.compareAt || p.compareAt <= p.price) return 0;
  return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
}

export function initials(name: string): string {
  return name
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function ProductImage({ product, height = 260 }: { product: Product; height?: number }) {
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

export const CATEGORY_IMAGES: Record<string, string> = {
  Women: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80&auto=format&fit=crop',
  Men: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80&auto=format&fit=crop',
  Kids: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&auto=format&fit=crop',
  Abaya: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80&auto=format&fit=crop',
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Women: 'Suits, shawls and winter wear for women — embroidered lawn, khaddar, chiffon and warm wool blends, stitched ready to wear.',
  Men: 'Kurtas, shalwar kameez, sweaters, shawls and winter essentials for men — classic cuts at family-friendly prices.',
  Kids: 'Warm, comfortable clothing for children — winter sets, kurtas, frocks and party wear in soft, easy-wash fabrics.',
  Abaya: 'Modest abayas in flowing fabrics — plain, embroidered and everyday styles, some with a matching hijab included.',
};

export const CATEGORY_SLUGS: Record<string, string> = {
  women: 'Women',
  men: 'Men',
  kids: 'Kids',
  abaya: 'Abaya',
};

/* ---------------- shop state (cart + wishlist) ---------------- */
export interface CartLine {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  colour: string;
  qty: number;
}

interface ShopContextValue {
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  delivery: number;
  total: number;
  addToCart: (product: Product, size?: string, colour?: string, qty?: number) => void;
  setQty: (index: number, qty: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readJSON<CartLine[]>('ifc_cart', []));
    setWishlist(readJSON<string[]>('ifc_wishlist', []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem('ifc_cart', JSON.stringify(cart)); } catch { /* ignore */ }
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem('ifc_wishlist', JSON.stringify(wishlist)); } catch { /* ignore */ }
    }
  }, [wishlist, hydrated]);

  const value = useMemo<ShopContextValue>(() => {
    const cartCount = cart.reduce((n, l) => n + l.qty, 0);
    const subtotal = cart.reduce((n, l) => n + l.price * l.qty, 0);
    const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    return {
      cart,
      cartCount,
      subtotal,
      delivery,
      total: subtotal + delivery,
      addToCart: (product, size, colour, qty = 1) => {
        const s = size || product.sizes[0] || 'One Size';
        const c = colour || product.colours[0] || '';
        setCart((prev) => {
          const idx = prev.findIndex((l) => l.productId === product.id && l.size === s && l.colour === c);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], qty: next[idx].qty + qty };
            return next;
          }
          return [...prev, { productId: product.id, name: product.name, price: product.price, image: product.image, size: s, colour: c, qty }];
        });
      },
      setQty: (index, qty) => {
        setCart((prev) => (qty <= 0 ? prev.filter((_, i) => i !== index) : prev.map((l, i) => (i === index ? { ...l, qty } : l))));
      },
      clearCart: () => setCart([]),
      wishlist,
      toggleWishlist: (id) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
      drawerOpen,
      setDrawerOpen,
    };
  }, [cart, wishlist, drawerOpen]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

/* ---------------- header ---------------- */
const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Women', href: '/category/women' },
  { label: 'Men', href: '/category/men' },
  { label: 'Kids', href: '/category/kids' },
  { label: 'Abaya', href: '/category/abaya' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function SiteHeader() {
  const { cartCount, wishlist, setDrawerOpen } = useShop();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [maxDiscount, setMaxDiscount] = useState(33);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((ps: Product[]) => {
        const ds = ps.map(discountPct);
        if (ds.length) setMaxDiscount(Math.max(...ds));
      })
      .catch(() => undefined);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
  }

  return (
    <>
      <div style={{ background: '#f2f35c', color: '#100f2e', textAlign: 'center', padding: '6px 12px', fontSize: 12, fontWeight: 700, letterSpacing: '.04em' }}>
        Winter Sale is on — up to {maxDiscount || 33}% off selected styles &nbsp;·&nbsp; Cash on Delivery across Pakistan
      </div>
      <header style={{ background: '#100f2e', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/" aria-label="Ibrahim's Family Collection — home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={LOGO_WIDE_DATA_URI} alt="Ibrahim's Family Collection logo" width={136} height={52} className="site-logo" style={{ objectFit: 'contain' }} />
          </Link>
          <form onSubmit={submitSearch} style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 999, padding: '7px 14px', gap: 8 }}>
            <span style={{ color: '#100f2e', display: 'inline-flex' }}><Icon d={ICONS.search} size={18} /></span>
            <input
              aria-label="Search products"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search suits, kurtas, abayas, kids wear…"
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 15, background: 'transparent' }}
            />
          </form>
          <Link
            href="/wishlist"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.6)', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
            aria-label="View wishlist"
          >
            <Icon d={ICONS.heart} size={18} /> Wishlist ({wishlist.length})
          </Link>
          <button className="btn btn-gold" style={{ padding: '8px 14px', fontSize: 14 }} onClick={() => setDrawerOpen(true)} aria-label="Open shopping bag">
            <Icon d={ICONS.bag} size={18} /> Bag ({cartCount})
          </button>
          <Link href="/admin" style={{ fontSize: 14, fontWeight: 700, color: '#f2f35c' }}>Admin</Link>
        </div>
        <nav style={{ maxWidth: 1180, margin: '0 auto', padding: '0 16px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }} aria-label="Main navigation">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href || (l.href.startsWith('/category/') && pathname === l.href);
            return (
              <Link key={l.href} href={l.href} className={`chip ${active ? 'active' : ''}`} style={{ textDecoration: 'none', display: 'inline-block' }}>
                {l.label}
              </Link>
            );
          })}
          <Link href="/track" className="chip" style={{ textDecoration: 'none', display: 'inline-block', marginLeft: 'auto' }}>
            Track Order
          </Link>
        </nav>
      </header>
      <BagDrawer />
    </>
  );
}

/* ---------------- bag drawer ---------------- */
function BagDrawer() {
  const { cart, cartCount, subtotal, delivery, total, setQty, drawerOpen, setDrawerOpen } = useShop();
  if (!drawerOpen) return null;
  return (
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
              <div key={`${line.productId}-${line.size}-${line.colour}-${i}`} style={{ display: 'flex', gap: 12, marginBottom: 16, borderBottom: '1px solid #e8e6df', paddingBottom: 14 }}>
                <Link href={`/product/${line.productId}`} onClick={() => setDrawerOpen(false)} style={{ width: 72, flexShrink: 0 }}>
                  {line.image ? (
                    <img src={line.image} alt={line.name} style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: '100%', height: 84, background: '#100f2e', borderRadius: 8 }} />
                  )}
                </Link>
                <div style={{ flex: 1 }}>
                  <Link href={`/product/${line.productId}`} onClick={() => setDrawerOpen(false)} style={{ fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>{line.name}</Link>
                  <div style={{ fontSize: 13, color: '#6b6a7d' }}>{line.size}{line.colour ? ` · ${line.colour}` : ''}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span>
                      <button className="chip" style={{ padding: '3px 10px' }} onClick={() => setQty(i, line.qty - 1)} aria-label="Decrease quantity">−</button>
                      <span style={{ margin: '0 8px', fontWeight: 700 }}>{line.qty}</span>
                      <button className="chip" style={{ padding: '3px 10px' }} onClick={() => setQty(i, line.qty + 1)} aria-label="Increase quantity">+</button>
                    </span>
                    <strong>{formatPKR(line.price * line.qty)}</strong>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #100f2e', marginTop: 8, paddingTop: 8 }}>
                <span>Total</span><strong style={{ fontSize: 18 }}>{formatPKR(total)}</strong>
              </div>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: 20, borderTop: '1px solid #e8e6df', display: 'grid', gap: 10 }}>
            <Link href="/checkout" className="btn btn-navy" style={{ width: '100%' }} onClick={() => setDrawerOpen(false)}>Checkout — Cash on Delivery</Link>
            <button className="btn btn-ghost" onClick={() => setDrawerOpen(false)}>Continue Shopping</button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ---------------- footer ---------------- */
export function SiteFooter() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => undefined);
  }, []);
  const address = settings?.address || 'ABC Road, Near Ideal Bakery, Gulfishan Colony, Faisalabad, Pakistan';
  const hours = settings?.hours || '10:00 AM to 8:00 PM Mon–Sat, closed Sundays';
  const phone = settings?.phone || '0321-0066789';
  const email = settings?.email || 'info@ibrahimsfc.com';
  const facebook = settings?.facebook || 'https://www.facebook.com/ibrahimsfc.official/';
  const linkStyle: React.CSSProperties = { color: '#f2f35c', textDecoration: 'none', display: 'block', lineHeight: 2, fontSize: 14 };
  return (
    <footer style={{ background: '#100f2e', color: '#fff' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
        <div>
          <img src={LOGO_WIDE_DATA_URI} alt="Ibrahim's Family Collection logo" width={125} height={48} className="footer-logo" style={{ objectFit: 'contain' }} />
          <p style={{ color: '#cfcfe0', lineHeight: 1.6, fontSize: 14, marginTop: 12 }}>
            Family clothing for Men, Women, Kids and Abaya — serving Faisalabad since 2015.
          </p>
          {facebook && (
            <a href={facebook} target="_blank" rel="noreferrer" style={{ color: '#f2f35c', fontSize: 14 }}>Facebook — 2,580 followers</a>
          )}
        </div>
        <div>
          <h3 style={{ fontSize: 17, marginBottom: 10, color: '#fff' }}>Shop</h3>
          <Link href="/shop" style={linkStyle}>Shop All</Link>
          <Link href="/category/women" style={linkStyle}>Women</Link>
          <Link href="/category/men" style={linkStyle}>Men</Link>
          <Link href="/category/kids" style={linkStyle}>Kids</Link>
          <Link href="/category/abaya" style={linkStyle}>Abaya</Link>
        </div>
        <div>
          <h3 style={{ fontSize: 17, marginBottom: 10, color: '#fff' }}>Help</h3>
          <Link href="/track" style={linkStyle}>Track Your Order</Link>
          <Link href="/contact" style={linkStyle}>Contact Us</Link>
          <Link href="/about" style={linkStyle}>About Us</Link>
          <Link href="/wishlist" style={linkStyle}>Your Wishlist</Link>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: '#cfcfe0', margin: '8px 0 0' }}>
            Cash on Delivery across Pakistan<br />
            Delivery PKR 250 · Free over PKR 5,000<br />
            7-day exchange in store
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: 17, marginBottom: 10, color: '#fff' }}>Visit the Store</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#cfcfe0', margin: 0 }}>
            {address}
            <br />{hours}
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: '#cfcfe0', margin: '10px 0 0' }}>
            Phone: <a href="tel:03210066789" style={{ color: '#f2f35c' }}>{phone}</a><br />
            Email: <a href="mailto:info@ibrahimsfc.com" style={{ color: '#f2f35c' }}>{email}</a>
          </p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(242,243,92,.35)', textAlign: 'center', padding: '14px 16px', fontSize: 13, color: '#cfcfe0' }}>
        © {new Date().getFullYear()} Ibrahim&rsquo;s Family Collection · ibrahimsfc.com · Stitched with care in Faisalabad
      </div>
    </footer>
  );
}

/* ---------------- page shell ---------------- */
export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

/* ---------------- product card ---------------- */
export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist, setDrawerOpen } = useShop();
  const pct = discountPct(product);
  const wished = wishlist.includes(product.id);
  return (
    <article className="card">
      <Link href={`/product/${product.id}`} style={{ display: 'block', position: 'relative', textDecoration: 'none' }}>
        <ProductImage product={product} height={260} />
        {pct > 0 && <span className="sale-tag" style={{ position: 'absolute', top: 12, left: 12 }}>-{pct}%</span>}
        {product.badge && <span className="gold-label" style={{ position: 'absolute', top: 12, right: 12 }}>{product.badge}</span>}
      </Link>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, color: '#6b6a7d', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>{product.category}</div>
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: 18, marginTop: 4 }}>{product.name}</h3>
        </Link>
        <p style={{ margin: '8px 0 0' }}>
          <strong style={{ fontSize: 18 }}>{formatPKR(product.price)}</strong>
          {product.compareAt && <span style={{ marginLeft: 8, color: '#6b6a7d', fontSize: 14 }}><s>{formatPKR(product.compareAt)}</s></span>}
        </p>
        <p style={{ fontSize: 13, color: '#6b6a7d', margin: '6px 0 0' }}>
          Sizes: {product.sizes.join(', ')} · {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button
            className="btn btn-navy"
            style={{ flex: 1, padding: '10px 12px' }}
            disabled={product.stock <= 0}
            onClick={() => { addToCart(product); setDrawerOpen(true); }}
          >
            <Icon d={ICONS.bag} size={16} /> Add to Bag
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: '10px 12px', color: wished ? '#c03128' : '#100f2e', borderColor: wished ? '#c03128' : '#100f2e' }}
            onClick={() => toggleWishlist(product.id)}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Icon d={ICONS.heart} size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
