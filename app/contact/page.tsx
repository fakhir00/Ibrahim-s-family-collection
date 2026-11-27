'use client';

import { useEffect, useState } from 'react';
import { ICONS, Icon, StoreShell } from '@/lib/site';
import type { Settings } from '@/lib/types';

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => undefined);
  }, []);

  const address = settings?.address || 'ABC Road, Near Ideal Bakery, Gulfishan Colony, Faisalabad, Pakistan';
  const hours = settings?.hours || '10:00 AM to 8:00 PM Mon–Sat, closed Sundays';
  const phoneNo = settings?.phone || '0321-0066789';
  const email = settings?.email || 'info@ibrahimsfc.com';
  const facebook = settings?.facebook || 'https://www.facebook.com/ibrahimsfc.official/';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !message.trim()) {
      setError('Please add your name and your message.');
      return;
    }
    // Front-end only: no form backend is connected yet. The confirmation
    // tells the customer to call for a fast reply.
    setSent(true);
  }

  return (
    <StoreShell>
      <section style={{ background: '#100f2e', color: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 16px' }}>
          <span className="gold-label">We&rsquo;d love to hear from you</span>
          <h1 style={{ fontSize: 44, color: '#fff', marginTop: 12 }}>Contact Us</h1>
          <p style={{ color: '#cfcfe0', fontSize: 17, marginTop: 8, maxWidth: 640 }}>
            Questions about a product, an order, sizes or exchange? Visit the store, call us,
            or send a message below.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 16px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 26 }}>Visit the Store</h2>
            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {[
                { icon: ICONS.pin, title: 'Address', text: address },
                { icon: ICONS.phone, title: 'Phone', text: phoneNo },
                { icon: ICONS.clock, title: 'Hours', text: hours },
                { icon: ICONS.cash, title: 'Email', text: email },
              ].map((row) => (
                <div key={row.title} className="card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: '#100f2e', display: 'inline-flex' }}><Icon d={row.icon} size={22} /></span>
                  <span>
                    <strong style={{ display: 'block', color: '#100f2e' }}>{row.title}</strong>
                    <span style={{ fontSize: 14, color: '#6b6a7d' }}>{row.text}</span>
                  </span>
                </div>
              ))}
            </div>
            {facebook && (
              <p style={{ marginTop: 16 }}>
                <a href={facebook} target="_blank" rel="noreferrer" style={{ color: '#100f2e', fontWeight: 700 }}>
                  Follow us on Facebook — 2,580 followers
                </a>
              </p>
            )}
            <p style={{ color: '#6b6a7d', fontSize: 14, lineHeight: 1.7, marginTop: 8 }}>
              Cash on Delivery across Pakistan · Delivery PKR 250 · Free on orders over PKR 5,000 ·
              7-day exchange in store.
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 26 }}>Send a Message</h2>
            {sent ? (
              <div style={{ marginTop: 16 }}>
                <span style={{ display: 'inline-flex', color: '#100f2e', background: '#f4efe6', borderRadius: '50%', padding: 12 }}>
                  <Icon d={ICONS.check} size={28} />
                </span>
                <p style={{ color: '#6b6a7d', lineHeight: 1.7, marginTop: 12 }}>
                  Thank you, {name.trim()} — your message has been noted. This form is not
                  connected to a mailbox yet, so for a fast reply please call us at{' '}
                  <strong style={{ color: '#100f2e' }}>{phoneNo}</strong> (10 AM–8 PM, Mon–Sat).
                </p>
                <button className="btn btn-ghost" onClick={() => { setSent(false); setName(''); setPhone(''); setMessage(''); }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                <div>
                  <label className="lbl" htmlFor="ct-name">Your name</label>
                  <input id="ct-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label className="lbl" htmlFor="ct-phone">Phone (optional)</label>
                  <input id="ct-phone" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" />
                </div>
                <div>
                  <label className="lbl" htmlFor="ct-msg">Message</label>
                  <textarea id="ct-msg" className="field" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about a product, an order, sizes, exchange…" />
                </div>
                {error && <p style={{ color: '#c03128', fontSize: 14, margin: 0 }}>{error}</p>}
                <div>
                  <button className="btn btn-navy" type="submit">Send Message</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
