// Custom hooks

import { useEffect, useRef } from 'react';
import { useCoinStore, useSettingsStore, useTrendingStore } from '../stores';

// Auto-refresh hook for polling
export function usePolling() {
    const { fetchCoins } = useCoinStore();
    const { autoRefreshEnabled, autoRefreshInterval } = useSettingsStore();
    const { getActiveKeywords } = useTrendingStore();
    const { setTrendingKeywords } = useCoinStore();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Initial fetch
        const keywords = getActiveKeywords();
        setTrendingKeywords(keywords);
        fetchCoins();

        // Set up polling
        if (autoRefreshEnabled) {
            intervalRef.current = setInterval(() => {
                const keywords = getActiveKeywords();
                setTrendingKeywords(keywords);
                fetchCoins();
            }, autoRefreshInterval * 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefreshEnabled, autoRefreshInterval, fetchCoins, getActiveKeywords, setTrendingKeywords]);

    return intervalRef.current !== null;
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
    const debouncedValue = useRef(value);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            debouncedValue.current = value;
        }, delay);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [value, delay]);

    return debouncedValue.current;
}
