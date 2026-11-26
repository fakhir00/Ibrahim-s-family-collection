import { NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/store';
import type { Product } from '@/lib/types';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as Partial<Product>;
    const store = getStore();
    const idx = store.products.findIndex((p) => p.id === params.id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    store.products[idx] = { ...store.products[idx], ...body, id: params.id };
    saveStore();
    return NextResponse.json(store.products[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const store = getStore();
  const idx = store.products.findIndex((p) => p.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  const [removed] = store.products.splice(idx, 1);
  saveStore();
  return NextResponse.json({ deleted: removed.id });
}
