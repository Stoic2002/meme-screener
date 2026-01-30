// Watchlist Page

import { useEffect } from 'react';
import { Container } from '../components/layout';
import { WatchlistItem } from '../components/watchlist';
import { useWatchlistStore, useCoinStore, useSettingsStore } from '../stores';
import { dexScreenerApi } from '../services';
import { processCoin } from '../utils';

export function Watchlist() {
    const { entries, updateCoin, updateExitSignals } = useWatchlistStore();
    const { trendingKeywords } = useCoinStore();
    const { autoRefreshEnabled, autoRefreshInterval } = useSettingsStore();

    // Update watchlist entries with fresh data
    useEffect(() => {
        const updateWatchlist = async () => {
            for (const entry of entries) {
                const pair = await dexScreenerApi.getTokenByAddress(entry.coin.baseToken.address);
                if (pair) {
                    const processed = processCoin(pair, trendingKeywords);
                    updateCoin(processed);
                }
            }
            updateExitSignals();
        };

        // Initial update
        updateWatchlist();

        // Set up polling
        let interval: ReturnType<typeof setInterval> | null = null;
        if (autoRefreshEnabled) {
            interval = setInterval(updateWatchlist, autoRefreshInterval * 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [entries.length, autoRefreshEnabled, autoRefreshInterval, trendingKeywords, updateCoin, updateExitSignals]);

    // Calculate portfolio stats
    const totalValue = entries.reduce((sum, e) => sum + parseFloat(e.coin.priceUsd), 0);
    const diversificationWarnings = entries.filter((e) => {
        const percentage = (parseFloat(e.coin.priceUsd) / totalValue) * 100;
        return percentage > 10;
    });

    return (
        <Container>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1
                    className="font-pixel"
                    style={{
                        fontSize: '16px',
                        marginBottom: '8px',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    ⭐ WATCHLIST
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Track your favorite coins with exit signals and take profit targets
                </p>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px',
                }}
            >
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                        TRACKED COINS
                    </span>
                    <span
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--color-accent-cyan)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {entries.length}
                    </span>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                        EXIT SIGNALS
                    </span>
                    <span
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--color-warning)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {entries.reduce((sum, e) => sum + e.exitSignals.length, 0)}
                    </span>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                        🔥 HOT COINS
                    </span>
                    <span
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--color-tier-hot)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {entries.filter(e => e.coin.tier === 'hot').length}
                    </span>
                </div>
            </div>

            {/* Diversification Warning */}
            {diversificationWarnings.length > 0 && (
                <div
                    style={{
                        padding: '12px 16px',
                        marginBottom: '24px',
                        backgroundColor: 'var(--color-warning-bg)',
                        border: '2px solid var(--color-warning)',
                        fontSize: '12px',
                        color: 'var(--color-warning)',
                    }}
                >
                    ⚠️ RISK WARNING: Some coins have high portfolio concentration (&gt;10%)
                </div>
            )}

            {/* Watchlist Grid */}
            {entries.length > 0 ? (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '16px',
                    }}
                >
                    {entries.map((entry) => (
                        <WatchlistItem key={entry.coin.baseToken.address} entry={entry} />
                    ))}
                </div>
            ) : (
                <div
                    className="card"
                    style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
                    <h3
                        className="font-pixel"
                        style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--color-text-primary)' }}
                    >
                        NO COINS IN WATCHLIST
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                        Add coins from the Pump Detector to track them here
                    </p>
                </div>
            )}
        </Container>
    );
}
