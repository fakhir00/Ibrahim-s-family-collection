import type { Metadata } from 'next';
import { Fraunces, Public_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-heading', weight: ['500', '600', '700'] });
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: "Ibrahim's Family Collection — Family Clothing, Faisalabad · Design V3 · Logo Navy (dark)",
  description:
    "Ibrahim's Family Collection — clothing for Men, Women, Kids and Abaya in Faisalabad since 2015. Cash on Delivery across Pakistan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
