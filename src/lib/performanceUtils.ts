// Performance optimization utilities

// 31. Debounce function with type safety
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// 32. Throttle function with type safety
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 33. Memoize function results
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// 34. Lazy load with intersection observer
export function lazyLoad(
  element: HTMLElement,
  callback: () => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
  }, options);
  
  observer.observe(element);
  return () => observer.disconnect();
}

// 35. Request idle callback with fallback
export function requestIdleTask(callback: () => void, timeout = 1000): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

// 36. Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]): void {
  requestAnimationFrame(() => {
    for (const update of updates) {
      update();
    }
  });
}

// 37. Measure component render time
export function measureRenderTime(componentName: string): () => void {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    if (duration > 16) {
      console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
}

// 38. Preload resources
export function preloadResource(url: string, type: 'image' | 'audio' | 'fetch'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    } else if (type === 'audio') {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve();
      audio.onerror = reject;
      audio.src = url;
    } else {
      fetch(url, { mode: 'no-cors' }).then(() => resolve()).catch(reject);
    }
  });
}

// 39. Virtual scroll helper
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);
  return { start, end };
}

// 40. Image optimization helper
export function getOptimizedImageUrl(url: string, width: number, quality = 80): string {
  if (!url) return '';
  
  // Handle Supabase storage URLs
  if (url.includes('supabase.co/storage')) {
    return `${url}?width=${width}&quality=${quality}`;
  }
  
  // Return original for other URLs
  return url;
}

// 41. Connection quality detector
export function getConnectionQuality(): 'slow' | 'medium' | 'fast' {
  const connection = (navigator as any).connection;
  if (!connection) return 'medium';
  
  const effectiveType = connection.effectiveType;
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
  if (effectiveType === '3g') return 'medium';
  return 'fast';
}

// 42. Memory usage tracker
export function getMemoryUsage(): { used: number; limit: number } | null {
  const memory = (performance as any).memory;
  if (!memory) return null;
  return {
    used: memory.usedJSHeapSize,
    limit: memory.jsHeapSizeLimit,
  };
}

// 43. Frame rate monitor
export function monitorFrameRate(callback: (fps: number) => void): () => void {
  let frameCount = 0;
  let lastTime = performance.now();
  let animationId: number;
  
  const measure = () => {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      callback(frameCount);
      frameCount = 0;
      lastTime = now;
    }
    animationId = requestAnimationFrame(measure);
  };
  
  animationId = requestAnimationFrame(measure);
  return () => cancelAnimationFrame(animationId);
}

// 44. Async queue for rate limiting
export class AsyncQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return;
    
    this.running++;
    const task = this.queue.shift()!;
    await task();
    this.running--;
    this.process();
  }
}

// 45. Prefetch pages on hover
export function prefetchOnHover(element: HTMLElement, url: string): () => void {
  let prefetchLink: HTMLLinkElement | null = null;
  
  const handleMouseEnter = () => {
    prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = url;
    document.head.appendChild(prefetchLink);
  };
  
  const handleMouseLeave = () => {
    if (prefetchLink) {
      document.head.removeChild(prefetchLink);
      prefetchLink = null;
    }
  };
  
  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);
  
  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    if (prefetchLink) document.head.removeChild(prefetchLink);
  };
}
