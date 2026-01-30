// Coins store - manages coin data state

import { create } from 'zustand';
import type { ProcessedCoin, TierType } from '../types';
import { dexScreenerApi } from '../services';
import { processCoin } from '../utils';

interface CoinFilters {
    search: string;
    tier: TierType | 'all';
    scoreRange: [number, number];
    volumeMin: number;
    age: 'all' | '1m' | '5m' | '30m' | '1h' | '2h' | '6h' | '24h';
}

interface CoinState {
    coins: ProcessedCoin[];
    filteredCoins: ProcessedCoin[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    filters: CoinFilters;
    trendingKeywords: string[];

    // Actions
    fetchCoins: () => Promise<void>;
    setFilters: (filters: Partial<CoinFilters>) => void;
    setTrendingKeywords: (keywords: string[]) => void;
    searchCoins: (query: string) => Promise<void>;
    isPumpMode: boolean;
    togglePumpMode: () => Promise<void>;
}

const defaultFilters: CoinFilters = {
    search: '',
    tier: 'all',
    scoreRange: [0, 100],
    volumeMin: 0,
    age: 'all',
};

function applyFilters(coins: ProcessedCoin[], filters: CoinFilters): ProcessedCoin[] {
    return coins.filter(coin => {
        // Search filter
        if (filters.search) {
            const search = filters.search.toLowerCase();
            const matchesSearch =
                coin.baseToken.name.toLowerCase().includes(search) ||
                coin.baseToken.symbol.toLowerCase().includes(search) ||
                coin.baseToken.address.toLowerCase().includes(search);
            if (!matchesSearch) return false;
        }

        // Tier filter
        if (filters.tier !== 'all' && coin.tier !== filters.tier) {
            return false;
        }

        // Score filter
        if (
            coin.scamScore.score < filters.scoreRange[0] ||
            coin.scamScore.score > filters.scoreRange[1]
        ) {
            return false;
        }

        // Volume filter
        if ((coin.volume?.h24 || 0) < filters.volumeMin) {
            return false;
        }

        // Age filter
        if (filters.age !== 'all') {
            const ageMap: Record<string, number> = {
                '1m': 1,
                '5m': 5,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '6h': 360,
                '24h': 1440,
            };
            const maxMinutes = ageMap[filters.age] || 1440;
            if (coin.ageMinutes > maxMinutes) {
                return false;
            }
        }

        return true;
    });
}

export const useCoinStore = create<CoinState>((set, get) => ({
    coins: [],
    filteredCoins: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    filters: defaultFilters,
    trendingKeywords: [],

    fetchCoins: async () => {
        set({ isLoading: true, error: null });
        try {
            const keywords = get().trendingKeywords;
            // Pass dynamic keywords to the API
            const pairs = await dexScreenerApi.getTrendingSolanaTokens(keywords);

            const processed = pairs.map(pair => processCoin(pair, keywords));

            // Sort by tier priority (hot > watch > monitor > none)
            const tierOrder: Record<TierType, number> = { hot: 0, watch: 1, monitor: 2, none: 3 };
            processed.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

            const filtered = applyFilters(processed, get().filters);
            set({
                coins: processed,
                filteredCoins: filtered,
                isLoading: false,
                lastUpdated: new Date(),
            });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch coins',
            });
        }
    },

    setFilters: (newFilters) => {
        const filters = { ...get().filters, ...newFilters };
        const filtered = applyFilters(get().coins, filters);
        set({ filters, filteredCoins: filtered });
    },

    setTrendingKeywords: (keywords) => {
        set({ trendingKeywords: keywords });
        // Re-process coins with new keywords
        const coins = get().coins.map(coin => ({
            ...coin,
            ...(() => {
                const name = coin.baseToken.name.toLowerCase();
                const symbol = coin.baseToken.symbol.toLowerCase();
                const matchedKeywords = keywords.filter(k => {
                    const keyword = k.toLowerCase();
                    return name.includes(keyword) || symbol.includes(keyword);
                });
                return {
                    matchesTrending: matchedKeywords.length > 0,
                    trendingKeywords: matchedKeywords,
                };
            })(),
        }));
        const filtered = applyFilters(coins, get().filters);
        set({ coins, filteredCoins: filtered });
    },

    searchCoins: async (query) => {
        if (!query.trim()) {
            if (get().isPumpMode) {
                // If in pump mode and search cleared, re-fetch pumps
                const pairs = await dexScreenerApi.getPumpTokens();
                const keywords = get().trendingKeywords;
                const processed = pairs.map(pair => processCoin(pair, keywords));
                // logic needed to sort processed by pump score if needed, but API did it
                // We keep them in order returned
                const filtered = applyFilters(processed, get().filters);
                set({
                    coins: processed,
                    filteredCoins: filtered,
                    isLoading: false,
                    lastUpdated: new Date(),
                });
            } else {
                get().fetchCoins();
            }
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const pairs = await dexScreenerApi.searchTokens(query);
            const keywords = get().trendingKeywords;
            const processed = pairs.map(pair => processCoin(pair, keywords));
            const filtered = applyFilters(processed, get().filters);
            set({
                coins: processed,
                filteredCoins: filtered,
                isLoading: false,
                lastUpdated: new Date(),
            });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Search failed',
            });
        }
    },

    // Pump Mode
    isPumpMode: false,
    togglePumpMode: async () => {
        const newMode = !get().isPumpMode;
        set({ isPumpMode: newMode, isLoading: true });

        try {
            if (newMode) {
                // Fetch Pump Tokens
                const pairs = await dexScreenerApi.getPumpTokens();
                const keywords = get().trendingKeywords;
                const processed = pairs.map(pair => processCoin(pair, keywords));

                // No tier sort here, rely on Pump Score order from API

                const filtered = applyFilters(processed, get().filters);
                set({
                    coins: processed,
                    filteredCoins: filtered,
                    isLoading: false,
                    lastUpdated: new Date(),
                });
            } else {
                // Return to normal trending
                get().fetchCoins();
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to switch mode',
            });
        }
    }
}));
