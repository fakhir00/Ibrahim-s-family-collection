import { NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/store';
import type { Product } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getStore().products);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Product>;
    if (!body.name || typeof body.price !== 'number' || !body.category) {
      return NextResponse.json(
        { error: 'name, price and category are required' },
        { status: 400 },
      );
    }
    const store = getStore();
    const product: Product = {
      id: 'p' + Date.now().toString(36),
      name: body.name,
      price: body.price,
      compareAt: body.compareAt,
      category: body.category,
      sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes : ['One Size'],
      colours: Array.isArray(body.colours) && body.colours.length ? body.colours : [],
      stock: typeof body.stock === 'number' ? body.stock : 0,
      image: body.image || '',
      badge: body.badge,
      description: body.description || '',
    };
    store.products.push(product);
    saveStore();
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
