// Watchlist store - manages saved coins with exit signals

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WatchlistEntry, ExitSignal, ProcessedCoin } from '../types';
import { calculateMockRSI } from '../utils';

interface WatchlistState {
    entries: WatchlistEntry[];

    // Actions
    addToWatchlist: (coin: ProcessedCoin, entryPrice?: number) => void;
    removeFromWatchlist: (address: string) => void;
    updateEntryPrice: (address: string, price: number) => void;
    updateCoin: (coin: ProcessedCoin) => void;
    isInWatchlist: (address: string) => boolean;
    updateExitSignals: () => void;
}

// Generate exit signals based on coin data
function generateExitSignals(entry: WatchlistEntry, previousEntry?: WatchlistEntry): ExitSignal[] {
    const signals: ExitSignal[] = [];
    const coin = entry.coin;

    // Check for volume drop >50%
    if (previousEntry) {
        const prevVolume = previousEntry.coin.volume?.h24 || 0;
        const currentVolume = coin.volume?.h24 || 0;
        if (prevVolume > 0 && currentVolume < prevVolume * 0.5) {
            signals.push({
                type: 'volume_drop',
                message: 'Volume dropped >50% in 24h',
                severity: 'warning',
                timestamp: Date.now(),
            });
        }
    }

    // Check RSI (mock)
    const rsi = calculateMockRSI();
    if (rsi > 70) {
        signals.push({
            type: 'rsi_overbought',
            message: `RSI is overbought (${rsi.toFixed(0)})`,
            severity: 'warning',
            timestamp: Date.now(),
        });
    }

    // Check for whale selling (mock based on sell pressure)
    const txns = coin.txns?.h1;
    if (txns && txns.sells > txns.buys * 2) {
        signals.push({
            type: 'whale_selling',
            message: 'High sell pressure detected',
            severity: 'danger',
            timestamp: Date.now(),
        });
    }

    return signals;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set, get) => ({
            entries: [],

            addToWatchlist: (coin, entryPrice) => {
                const exists = get().entries.find(e => e.coin.baseToken.address === coin.baseToken.address);
                if (exists) return;

                const newEntry: WatchlistEntry = {
                    coin,
                    addedAt: Date.now(),
                    entryPrice: entryPrice || parseFloat(coin.priceUsd),
                    targetMultiples: [2, 5, 10],
                    exitSignals: [],
                };

                set(state => ({
                    entries: [...state.entries, newEntry],
                }));
            },

            removeFromWatchlist: (address) => {
                set(state => ({
                    entries: state.entries.filter(e => e.coin.baseToken.address !== address),
                }));
            },

            updateEntryPrice: (address, price) => {
                set(state => ({
                    entries: state.entries.map(e =>
                        e.coin.baseToken.address === address ? { ...e, entryPrice: price } : e
                    ),
                }));
            },

            updateCoin: (coin) => {
                set(state => ({
                    entries: state.entries.map(e => {
                        if (e.coin.baseToken.address !== coin.baseToken.address) return e;
                        const signals = generateExitSignals({ ...e, coin }, e);
                        return { ...e, coin, exitSignals: signals };
                    }),
                }));
            },

            isInWatchlist: (address) => {
                return get().entries.some(e => e.coin.baseToken.address === address);
            },

            updateExitSignals: () => {
                set(state => ({
                    entries: state.entries.map(e => ({
                        ...e,
                        exitSignals: generateExitSignals(e),
                    })),
                }));
            },
        }),
        {
            name: 'meme-screener-watchlist',
        }
    )
);
