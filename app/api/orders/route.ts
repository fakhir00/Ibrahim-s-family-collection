import { NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/store';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/types';
import type { Order, OrderItem } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getStore().orders);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      customer?: string;
      phone?: string;
      address?: string;
      city?: string;
      items?: Array<{ productId: string; qty: number; size?: string; colour?: string }>;
    };
    if (!body.customer || !body.phone || !body.address || !body.city) {
      return NextResponse.json(
        { error: 'customer, phone, address and city are required' },
        { status: 400 },
      );
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }
    const store = getStore();
    const items: OrderItem[] = [];
    let subtotal = 0;
    for (const line of body.items) {
      const product = store.products.find((p) => p.id === line.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${line.productId}` },
          { status: 400 },
        );
      }
      const qty = Math.max(1, Math.floor(line.qty || 1));
      if (product.stock < qty) {
        return NextResponse.json(
          { error: `Not enough stock for ${product.name}` },
          { status: 400 },
        );
      }
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        qty,
        size: line.size || product.sizes[0] || 'One Size',
        colour: line.colour || product.colours[0] || '',
        image: product.image,
      });
      subtotal += product.price * qty;
    }
    const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const order: Order = {
      id: 'IFC-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      customer: body.customer,
      phone: body.phone,
      address: body.address,
      city: body.city,
      items,
      subtotal,
      delivery,
      total: subtotal + delivery,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    for (const item of items) {
      const product = store.products.find((p) => p.id === item.productId);
      if (product) product.stock -= item.qty;
    }
    store.orders.unshift(order);
    saveStore();
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
