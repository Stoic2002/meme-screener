// Watchlist types with exit signals and take profit tracking

import type { ProcessedCoin } from './coin';

export type ExitSignalType = 'whale_selling' | 'volume_drop' | 'rsi_overbought';

export interface ExitSignal {
    type: ExitSignalType;
    message: string;
    severity: 'warning' | 'danger';
    timestamp: number;
}

export interface WatchlistEntry {
    coin: ProcessedCoin;
    addedAt: number;
    entryPrice?: number;
    targetMultiples: number[]; // e.g., [2, 5, 10] for 2x, 5x, 10x
    exitSignals: ExitSignal[];
    notes?: string;
}

export interface TakeProfitLevel {
    multiple: number;
    targetPrice: number;
    reached: boolean;
}

export interface PortfolioAllocation {
    coinAddress: string;
    percentage: number;
    isDiversified: boolean; // false if >10% in one coin
}
