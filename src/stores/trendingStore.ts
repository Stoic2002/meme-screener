// Trending keywords store - manages social media correlation

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrendingKeyword } from '../types';
import { fetchTrendingCoins } from '../services/trendingService';

interface TrendingState {
    keywords: TrendingKeyword[];
    isInitialized: boolean;

    // Actions
    initializeDefaults: () => void;
    addKeyword: (keyword: string, source?: 'twitter' | 'tiktok' | 'custom') => void;
    removeKeyword: (id: string) => void;
    toggleKeyword: (id: string) => void;
    clearKeywords: () => void;
    getActiveKeywords: () => string[];
    resetToDefaults: () => void;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}



export const useTrendingStore = create<TrendingState>()(
    persist(
        (set, get) => ({
            keywords: [],
            isInitialized: false,

            initializeDefaults: () => {
                const state = get();

                // If not initialized, mark as initialized (with empty list initially)
                if (!state.isInitialized) {
                    set({ isInitialized: true });
                }

                // Fetch live data directly
                fetchTrendingCoins().then((trendingCoins) => {
                    const currentKeywords = get().keywords;

                    // If we have no keywords at all, use ALL fetched coins
                    if (currentKeywords.length === 0 && trendingCoins.length > 0) {
                        const newKeywords: TrendingKeyword[] = trendingCoins.map(coin => ({
                            id: generateId(),
                            keyword: coin,
                            source: 'coingecko',
                            addedAt: Date.now(),
                            isActive: true,
                        }));
                        set({ keywords: newKeywords });
                        return;
                    }

                    // Otherwise merge new ones
                    const existingSet = new Set(currentKeywords.map(k => k.keyword.toLowerCase()));
                    const newKeywords: TrendingKeyword[] = trendingCoins
                        .filter(coin => !existingSet.has(coin.toLowerCase()))
                        .map(coin => ({
                            id: generateId(),
                            keyword: coin,
                            source: 'coingecko',
                            addedAt: Date.now(),
                            isActive: true,
                        }));

                    if (newKeywords.length > 0) {
                        set(state => ({
                            keywords: [...state.keywords, ...newKeywords]
                        }));
                    }
                });
            },

            addKeyword: (keyword, source = 'custom') => {
                const exists = get().keywords.some(
                    k => k.keyword.toLowerCase() === keyword.toLowerCase()
                );
                if (exists) return;

                const newKeyword: TrendingKeyword = {
                    id: generateId(),
                    keyword: keyword.trim().toLowerCase(),
                    source,
                    addedAt: Date.now(),
                    isActive: true,
                };

                set(state => ({
                    keywords: [...state.keywords, newKeyword],
                }));
            },

            removeKeyword: (id) => {
                set(state => ({
                    keywords: state.keywords.filter(k => k.id !== id),
                }));
            },

            toggleKeyword: (id) => {
                set(state => ({
                    keywords: state.keywords.map(k =>
                        k.id === id ? { ...k, isActive: !k.isActive } : k
                    ),
                }));
            },

            clearKeywords: () => {
                set({ keywords: [] });
            },

            getActiveKeywords: () => {
                return get().keywords.filter(k => k.isActive).map(k => k.keyword);
            },

            resetToDefaults: () => {
                // Clear all and re-fetch
                set({ keywords: [], isInitialized: true });
                get().initializeDefaults();
            },
        }),
        {
            name: 'meme-screener-trending',
            onRehydrateStorage: (_state) => {
                // After rehydration, initialize defaults if needed
                return (rehydratedState, error) => {
                    if (error) {
                        console.error('Error rehydrating trending store:', error);
                        return;
                    }
                    if (rehydratedState && (!rehydratedState.isInitialized || rehydratedState.keywords.length === 0)) {
                        rehydratedState.initializeDefaults();
                    }
                };
            },
        }
    )
);

// Auto-initialize on import
const initStore = () => {
    const state = useTrendingStore.getState();
    if (!state.isInitialized || state.keywords.length === 0) {
        state.initializeDefaults();
    }
};

// Run initialization
initStore();
