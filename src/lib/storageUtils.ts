// Storage utility functions for caching and persistence

// 11. Cache with expiration
export function setWithExpiry<T>(key: string, value: T, ttlMs: number): void {
  const item = {
    value,
    expiry: Date.now() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// 12. Get cached value with expiry check
export function getWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value as T;
  } catch {
    return null;
  }
}

// 13. LRU Cache implementation
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// 14. Compress string data for storage
export function compressString(str: string): string {
  try {
    return btoa(encodeURIComponent(str));
  } catch {
    return str;
  }
}

// 15. Decompress stored string
export function decompressString(compressed: string): string {
  try {
    return decodeURIComponent(atob(compressed));
  } catch {
    return compressed;
  }
}

// 16. Get storage usage info
export function getStorageUsage(): { used: number; quota: number } {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      used += (localStorage.getItem(key)?.length || 0) * 2; // UTF-16 = 2 bytes per char
    }
  }
  return { used, quota: 5 * 1024 * 1024 }; // 5MB typical quota
}

// 17. Clear expired cache entries
export function clearExpiredCache(): number {
  let cleared = 0;
  const keys = Object.keys(localStorage);
  
  for (const key of keys) {
    if (key.startsWith('cache_')) {
      const value = getWithExpiry(key);
      if (value === null) cleared++;
    }
  }
  
  return cleared;
}

// 18. Session storage helper with type safety
export function sessionStore<T>(key: string, value?: T): T | null {
  if (value !== undefined) {
    sessionStorage.setItem(key, JSON.stringify(value));
    return value;
  }
  const stored = sessionStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}

// 19. IndexedDB wrapper for large data
export async function idbStore(dbName: string, storeName: string, key: string, value?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, value !== undefined ? 'readwrite' : 'readonly');
      const store = tx.objectStore(storeName);
      
      if (value !== undefined) {
        store.put(value, key);
        resolve(value);
      } else {
        const getReq = store.get(key);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.error);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}

// 20. Batch storage operations
export function batchLocalStorage(operations: { type: 'set' | 'remove'; key: string; value?: string }[]): void {
  for (const op of operations) {
    if (op.type === 'set' && op.value !== undefined) {
      localStorage.setItem(op.key, op.value);
    } else if (op.type === 'remove') {
      localStorage.removeItem(op.key);
    }
  }
}
