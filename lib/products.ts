import type { Product, Settings } from './types';

/**
 * STARTER / SAMPLE CATALOG — 14 products to get the store going.
 * Only ONE product is real (p01, Men's Fleece Cargo Trousers, supplied by the
 * owner). The other 13 are plausible sample listings — edit, replace or delete
 * them from the Admin panel (Products tab) or by editing this file.
 */
export const STARTER_PRODUCTS: Product[] = [
  {
    id: 'p01',
    name: "Men's Fleece Cargo Trousers",
    price: 2199,
    compareAt: 2799,
    category: 'Men',
    sizes: ['28', '30', '32', '34', '36'],
    colours: ['White', 'Gray', 'Green'],
    stock: 24,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80&auto=format&fit=crop',
    badge: 'Winter Sale',
    description:
      'Warm fleece cargo trousers with roomy side pockets and a comfortable relaxed fit. Made for cold Faisalabad winters — soft inside, durable outside.',
  },
  {
    id: 'p02',
    name: "Women's Embroidered Lawn Suit — 3 Piece",
    price: 3499,
    compareAt: 4299,
    category: 'Women',
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Ivory', 'Teal', 'Maroon'],
    stock: 18,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80&auto=format&fit=crop',
    badge: 'Best Seller',
    description:
      'Classic embroidered lawn suit with a printed dupatta and dyed trouser. Breathable, colourfast and stitched ready to wear.',
  },
  {
    id: 'p03',
    name: "Men's Kurta — Cotton, Classic Cut",
    price: 1899,
    compareAt: 2499,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['White', 'Navy', 'Beige'],
    stock: 30,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80&auto=format&fit=crop',
    description:
      'Everyday cotton kurta with a neat collar and straight cut. Pairs with shalwar or trousers — a wardrobe staple for the whole family.',
  },
  {
    id: 'p04',
    name: 'Kids Winter Set — Hoodie & Trouser (2 Piece)',
    price: 1499,
    compareAt: 1999,
    category: 'Kids',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colours: ['Navy', 'Red', 'Gray'],
    stock: 40,
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&auto=format&fit=crop',
    badge: 'Winter Sale',
    description:
      'Soft fleece hoodie and trouser set to keep little ones warm. Easy to wash, easy to wear, made for everyday play.',
  },
  {
    id: 'p05',
    name: 'Abaya — Plain Black with Gold Stitch Detail',
    price: 4999,
    compareAt: 5999,
    category: 'Abaya',
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Black'],
    stock: 12,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80&auto=format&fit=crop',
    badge: 'New',
    description:
      'Elegant plain black abaya in flowing nidha fabric with a fine gold stitch along the sleeves. Modest, comfortable and easy to carry.',
  },
  {
    id: 'p06',
    name: "Women's Printed Lawn Suit — 2 Piece",
    price: 1999,
    category: 'Women',
    sizes: ['S', 'M', 'L'],
    colours: ['Pink', 'Yellow', 'Green'],
    stock: 22,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80&auto=format&fit=crop',
    description:
      'Bright printed lawn two-piece — shirt and trouser. Light, cool and perfect for daily wear at home or out.',
  },
  {
    id: 'p07',
    name: "Men's Shalwar Kameez — Wash & Wear",
    price: 2799,
    compareAt: 3499,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['White', 'Sky Blue', 'Gray'],
    stock: 26,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80&auto=format&fit=crop',
    description:
      'Crisp wash-and-wear shalwar kameez that stays neat all day. No ironing fuss — wash, hang, wear.',
  },
  {
    id: 'p08',
    name: 'Kids Frock — Embroidered Party Wear',
    price: 2499,
    compareAt: 2999,
    category: 'Kids',
    sizes: ['2-3Y', '4-5Y', '6-7Y'],
    colours: ['Pink', 'Yellow'],
    stock: 15,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80&auto=format&fit=crop',
    description:
      'A pretty embroidered frock for parties and family gatherings. Soft lining inside so it never itches.',
  },
  {
    id: 'p09',
    name: 'Abaya — Embroidered Front, Hijab Included',
    price: 6499,
    compareAt: 7999,
    category: 'Abaya',
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Black', 'Navy'],
    stock: 8,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80&auto=format&fit=crop',
    badge: 'Premium',
    description:
      'Embroidered-front abaya with a matching hijab included. Flowing fit, premium fabric, made for special occasions.',
  },
  {
    id: 'p10',
    name: "Women's Winter Shawl — Warm Wool Blend",
    price: 999,
    compareAt: 1499,
    category: 'Women',
    sizes: ['One Size'],
    colours: ['Maroon', 'Navy', 'Beige'],
    stock: 35,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80&auto=format&fit=crop',
    badge: 'Under 999',
    description:
      'A warm wool-blend shawl in rich winter colours. Soft, generous in size and easy to drape over any outfit.',
  },
  {
    id: 'p11',
    name: "Men's Winter Sweater — Half Zip",
    price: 1799,
    category: 'Men',
    sizes: ['M', 'L', 'XL'],
    colours: ['Navy', 'Gray', 'Green'],
    stock: 20,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80&auto=format&fit=crop',
    description:
      'A cosy half-zip sweater in a soft knit. Warm without being bulky — ideal over a kurta or a shirt.',
  },
  {
    id: 'p12',
    name: 'Kids Kurta Set — Festive (2 Piece)',
    price: 1299,
    compareAt: 1699,
    category: 'Kids',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colours: ['White', 'Yellow', 'Green'],
    stock: 28,
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80&auto=format&fit=crop',
    description:
      'A smart little kurta set for Eid, weddings and family photos. Comfortable cotton with a festive touch.',
  },
  {
    id: 'p13',
    name: "Women's Chiffon Suit — 3 Piece, Party Wear",
    price: 8490,
    compareAt: 9990,
    category: 'Women',
    sizes: ['S', 'M', 'L'],
    colours: ['Teal', 'Maroon', 'Ivory'],
    stock: 6,
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80&auto=format&fit=crop',
    badge: 'Premium',
    description:
      'Our finest party-wear chiffon suit — embroidered shirt, chiffon dupatta and silk trouser. Stitched ready to wear.',
  },
  {
    id: 'p14',
    name: "Men's Pashmina Shawl — Classic",
    price: 799,
    category: 'Men',
    sizes: ['One Size'],
    colours: ['Gray', 'Navy', 'Brown'],
    stock: 45,
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80&auto=format&fit=crop',
    badge: 'Under 999',
    description:
      'A classic pashmina shawl — warm, soft and generously sized. A winter essential at a family-friendly price.',
  },
];

export const DEFAULT_SETTINGS: Settings = {
  storeName: "Ibrahim's Family Collection",
  phone: '0321-0066789',
  email: 'info@ibrahimsfc.com',
  address: 'ABC Road, Near Ideal Bakery, Gulfishan Colony, Faisalabad, Pakistan',
  hours: '10:00 AM to 8:00 PM Mon–Sat, closed Sundays',
  facebook: 'https://www.facebook.com/ibrahimsfc.official/',
  instagram: '',
  youtube: '',
  tiktok: '',
};
