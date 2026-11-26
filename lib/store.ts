import fs from 'fs';
import { DEFAULT_SETTINGS, STARTER_PRODUCTS } from './products';
import type { Order, Product, Settings } from './types';

const STORE_PATH = '/tmp/ifc-store.json';

interface StoreData {
  products: Product[];
  orders: Order[];
  settings: Settings;
}

let cache: StoreData | null = null;

function seed(): StoreData {
  return {
    products: STARTER_PRODUCTS.map((p) => ({ ...p })),
    orders: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

function loadFromDisk(): StoreData | null {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as StoreData;
      if (Array.isArray(parsed.products) && Array.isArray(parsed.orders) && parsed.settings) {
        return parsed;
      }
    }
  } catch {
    // Disk persistence is best-effort only.
  }
  return null;
}

function persist() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(cache), 'utf8');
  } catch {
    // /tmp may not be writable in some environments — memory store still works.
  }
}

export function getStore(): StoreData {
  if (!cache) {
    cache = loadFromDisk() ?? seed();
  }
  return cache;
}

export function saveStore() {
  persist();
}

export function resetStore() {
  cache = seed();
  persist();
}
