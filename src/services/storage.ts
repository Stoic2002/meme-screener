// LocalStorage wrapper with type safety

const STORAGE_KEYS = {
    WATCHLIST: 'meme-screener-watchlist',
    TRENDING: 'meme-screener-trending',
    SETTINGS: 'meme-screener-settings',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

function get<T>(key: StorageKey, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        console.error(`Error reading from localStorage: ${key}`);
        return defaultValue;
    }
}

function set<T>(key: StorageKey, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage: ${key}`, error);
    }
}

function remove(key: StorageKey): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error);
    }
}

function clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}

export const storage = {
    KEYS: STORAGE_KEYS,
    get,
    set,
    remove,
    clear,
};
