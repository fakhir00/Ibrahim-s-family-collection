import { NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/store';
import type { OrderStatus } from '@/lib/types';

const VALID: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const store = getStore();
  const order = store.orders.find((o) => o.id === params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as { status?: string };
    if (!body.status || !VALID.includes(body.status as OrderStatus)) {
      return NextResponse.json(
        { error: 'status must be one of: ' + VALID.join(', ') },
        { status: 400 },
      );
    }
    const store = getStore();
    const order = store.orders.find((o) => o.id === params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    order.status = body.status as OrderStatus;
    saveStore();
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
