// Pump Detector - Main landing page

import { useEffect } from 'react';
import { useCoinStore, useTrendingStore, useSettingsStore } from '../stores';
import { Container } from '../components/layout';
import { SearchBar, Filter } from '../components/common';
import { CoinList } from '../components/coins';
import { FiActivity, FiZap } from 'react-icons/fi';

export function PumpDetector() {
    const { filteredCoins, isLoading, error, lastUpdated, fetchCoins, setTrendingKeywords, isPumpMode, togglePumpMode } = useCoinStore();
    const { getActiveKeywords } = useTrendingStore();
    const { autoRefreshEnabled, autoRefreshInterval } = useSettingsStore();

    // Initial fetch and set up polling
    useEffect(() => {
        // Set trending keywords
        const keywords = getActiveKeywords();
        setTrendingKeywords(keywords);

        // Initial fetch
        fetchCoins();

        // Set up polling
        let interval: ReturnType<typeof setInterval> | null = null;
        if (autoRefreshEnabled) {
            interval = setInterval(() => {
                const keywords = getActiveKeywords();
                setTrendingKeywords(keywords);
                fetchCoins();
            }, autoRefreshInterval * 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefreshEnabled, autoRefreshInterval, fetchCoins, getActiveKeywords, setTrendingKeywords]);

    // Count coins by tier
    const hotCount = filteredCoins.filter(c => c.tier === 'hot').length;
    const watchCount = filteredCoins.filter(c => c.tier === 'watch').length;
    const monitorCount = filteredCoins.filter(c => c.tier === 'monitor').length;

    return (
        <Container>
            {/* Page Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1
                        className="font-pixel"
                        style={{
                            fontSize: '16px',
                            marginBottom: '8px',
                            color: isPumpMode ? 'var(--color-accent-cyan)' : 'var(--color-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        {isPumpMode ? <FiZap className="pulse" /> : '🔥'}
                        {isPumpMode ? 'PUMP HUNTER ACTIVE' : 'PUMP DETECTOR'}
                    </h1>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {isPumpMode
                            ? 'Scanning for high-momentum tokens with >$1k volume in 1h'
                            : 'Real-time detection of potential pump opportunities on Solana'}
                    </p>
                </div>

                <button
                    onClick={togglePumpMode}
                    className={isPumpMode ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: isPumpMode ? '1px solid var(--color-accent-cyan)' : '1px solid var(--color-border)',
                        boxShadow: isPumpMode ? '0 0 10px var(--color-accent-cyan)40' : 'none'
                    }}
                >
                    <FiActivity />
                    {isPumpMode ? 'PUMP MODE ON' : 'ENABLE PUMP MODE'}
                </button>
            </div>

            {/* Tier Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px',
                }}
            >
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                        🔥 HOT
                    </span>
                    <span
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--color-tier-hot)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {hotCount}
                    </span>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                        ⚠️ WATCH
                    </span>
                    <span
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--color-tier-watch)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {watchCount}
                    </span>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                        📊 MONITOR
                    </span>
                    <span
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--color-tier-monitor)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {monitorCount}
                    </span>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                        TOTAL
                    </span>
                    <span
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {filteredCoins.length}
                    </span>
                </div>
            </div>

            {/* Search & Filters */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    alignItems: 'center',
                    marginBottom: '24px',
                    padding: '16px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '3px solid var(--color-border)',
                }}
            >
                <SearchBar />
                <Filter />
            </div>

            {/* Error State */}
            {error && (
                <div
                    style={{
                        padding: '16px',
                        marginBottom: '24px',
                        backgroundColor: 'var(--color-danger-bg)',
                        border: '3px solid var(--color-danger)',
                        color: 'var(--color-danger)',
                        fontSize: '12px',
                    }}
                >
                    ⚠️ Error: {error}
                </div>
            )}

            {/* Coin List */}
            <CoinList coins={filteredCoins} isLoading={isLoading} />

            {/* Last Updated Footer */}
            {lastUpdated && (
                <div
                    style={{
                        marginTop: '24px',
                        padding: '12px',
                        textAlign: 'center',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '2px solid var(--color-border)',
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    Last updated: {lastUpdated.toLocaleTimeString()} |
                    Auto-refresh: {autoRefreshEnabled ? `${autoRefreshInterval}s` : 'OFF'}
                </div>
            )}
        </Container>
    );
}
