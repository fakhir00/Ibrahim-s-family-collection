import Link from 'next/link';
import { StoreShell } from '@/lib/site';

export default function AboutPage() {
  return (
    <StoreShell>
      <section style={{ background: '#100f2e', color: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 16px' }}>
          <span className="gold-label">Since 2015 · Faisalabad</span>
          <h1 style={{ fontSize: 44, color: '#fff', marginTop: 12 }}>Our Story</h1>
          <p style={{ color: '#cfcfe0', fontSize: 17, marginTop: 8, maxWidth: 640 }}>
            Ibrahim&rsquo;s Family Collection is a family clothing store in Faisalabad — one
            store for the whole family.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 16px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 28 }}>A store for the whole family</h2>
            <p style={{ color: '#6b6a7d', lineHeight: 1.8, marginTop: 10 }}>
              Since 2015, Ibrahim&rsquo;s Family Collection has dressed families in Faisalabad —
              women, men and kids, and abaya. Our promise has stayed the same from the
              beginning: quality clothing at prices that respect your budget.
            </p>
            <p style={{ color: '#6b6a7d', lineHeight: 1.8 }}>
              You&rsquo;ll find embroidered lawn suits, kurtas, shalwar kameez, winter
              shawls and sweaters, kids&rsquo; sets and frocks, and modest abayas — stitched
              ready to wear, in sizes for the whole family.
            </p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 20 }}>Visit the Store</h3>
            <p style={{ color: '#6b6a7d', lineHeight: 1.8, marginTop: 10 }}>
              ABC Road, Near Ideal Bakery, Gulfishan Colony, Faisalabad, Pakistan
              <br />10:00 AM to 8:00 PM, Monday to Saturday
              <br />Closed on Sundays
            </p>
            <p style={{ marginTop: 12 }}>
              <Link href="/contact" className="btn btn-navy">Get in touch</Link>
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: 28, marginTop: 40 }}>How we work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 18 }}>
          {[
            { title: 'Quality checked', text: 'Every piece is checked before packing, so what arrives is what you would pick in the store.' },
            { title: 'Cash on Delivery', text: 'Shop online and pay in cash when your order arrives — anywhere in Pakistan.' },
            { title: 'Easy exchange', text: 'Wrong size? Exchange it in store within 7 days.' },
            { title: 'Family prices', text: 'Small prices, big warmth — winter sale styles up to 33% off, and best buys under PKR 999.' },
          ].map((c) => (
            <div key={c.title} className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 19 }}>{c.title}</h3>
              <p style={{ color: '#6b6a7d', lineHeight: 1.7, marginTop: 8, fontSize: 14 }}>{c.text}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, background: '#f4efe6', borderRadius: 16, padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 26 }}>Cozy. Simple. Winter.</h2>
            <p style={{ color: '#6b6a7d', marginTop: 6 }}>Browse the winter collection — new arrivals, style steals under PKR 1,999 and best buys under PKR 999.</p>
          </div>
          <Link href="/shop" className="btn btn-gold">Shop the Collection</Link>
        </div>
      </section>
    </StoreShell>
  );
}
