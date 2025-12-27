// Network utility functions

// 86. Retry fetch with exponential backoff
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status < 500) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error as Error;
    }
    
    if (i < maxRetries - 1) {
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// 87. Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// 88. Monitor online status
export function monitorOnlineStatus(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// 89. Timeout wrapper for promises
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
    promise
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// 90. Abort controller helper
export function createAbortableRequest(): {
  signal: AbortSignal;
  abort: () => void;
} {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
  };
}

// 91. Queue network requests
const requestQueue: Map<string, Promise<any>> = new Map();

export function deduplicateRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
  if (requestQueue.has(key)) {
    return requestQueue.get(key) as Promise<T>;
  }
  
  const promise = request().finally(() => {
    requestQueue.delete(key);
  });
  
  requestQueue.set(key, promise);
  return promise;
}

// 92. Parse URL query params
export function parseQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URL(url).searchParams;
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// 93. Build URL with params
export function buildUrl(base: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  return url.toString();
}

// 94. Download file
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 95. Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
