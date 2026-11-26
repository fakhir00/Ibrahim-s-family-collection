import { NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/store';
import type { Settings } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getStore().settings);
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<Settings>;
    const store = getStore();
    store.settings = { ...store.settings, ...body };
    saveStore();
    return NextResponse.json(store.settings);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
