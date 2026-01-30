// Simple cache utility with TTL

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class Cache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private defaultTTL = 5 * 60 * 1000; // 5 minutes

    set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const isExpired = Date.now() - entry.timestamp > entry.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Get remaining TTL in seconds
    getRemainingTTL(key: string): number {
        const entry = this.cache.get(key);
        if (!entry) return 0;

        const remaining = entry.ttl - (Date.now() - entry.timestamp);
        return Math.max(0, Math.floor(remaining / 1000));
    }
}

export const cache = new Cache();
