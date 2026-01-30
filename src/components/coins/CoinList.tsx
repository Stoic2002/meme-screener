// Coin list component with grid layout

import type { ProcessedCoin } from '../../types';
import { CoinCard } from './CoinCard';
import { CoinCardSkeleton } from '../common';

interface CoinListProps {
    coins: ProcessedCoin[];
    isLoading: boolean;
}

export function CoinList({ coins, isLoading }: CoinListProps) {
    if (isLoading && coins.length === 0) {
        return (
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '16px',
                }}
            >
                {Array.from({ length: 8 }).map((_, i) => (
                    <CoinCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (coins.length === 0) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    backgroundColor: 'var(--color-bg-card)',
                    border: '3px dashed var(--color-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                }}
            >
                <div
                    style={{
                        fontSize: '64px',
                        animation: 'pulse-glow 3s infinite',
                        filter: 'drop-shadow(0 0 10px var(--color-accent-purple))'
                    }}
                >
                    📡
                </div>
                <h3
                    className="font-pixel"
                    style={{
                        fontSize: '16px',
                        color: 'var(--color-text-primary)',
                        letterSpacing: '1px'
                    }}
                >
                    NO SIGNALS DETECTED
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '300px' }}>
                    The blockchain is quiet... or your filters are too strict. Try widening your search or check back in a few seconds.
                </p>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px',
            }}
        >
            {coins.map((coin) => (
                <CoinCard key={coin.pairAddress} coin={coin} />
            ))}
        </div>
    );
}
