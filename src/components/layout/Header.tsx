// Header component with logo and settings

import { FiRefreshCw, FiSettings } from 'react-icons/fi';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useCoinStore, useSettingsStore } from '../../stores';

export function Header() {
    const { lastUpdated, isLoading, fetchCoins } = useCoinStore();
    const { autoRefreshEnabled, autoRefreshInterval, toggleAutoRefresh } = useSettingsStore();

    return (
        <header
            style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderBottom: '3px solid var(--color-border)',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'var(--color-accent-purple)',
                        border: '3px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                    }}
                >
                    🎮
                </div>
                <div>
                    <h1
                        className="font-pixel"
                        style={{
                            fontSize: '14px',
                            color: 'var(--color-accent-cyan)',
                            letterSpacing: '1px',
                        }}
                    >
                        MEME SCREENER
                    </h1>
                    <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        SOLANA PUMP DETECTOR
                    </p>
                </div>
            </div>

            {/* Status & Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Last Updated */}
                {lastUpdated && (
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                )}

                {/* Wallet Button */}
                <WalletMultiButton style={{
                    height: '32px',
                    fontSize: '12px',
                    padding: '0 16px',
                    backgroundColor: 'var(--color-accent-purple)',
                    fontFamily: 'var(--font-mono)'
                }} />

                {/* Auto Refresh Toggle */}
                <button
                    onClick={toggleAutoRefresh}
                    className="btn btn-secondary"
                    style={{
                        fontSize: '10px',
                        padding: '6px 10px',
                        opacity: autoRefreshEnabled ? 1 : 0.5,
                    }}
                >
                    <FiSettings size={12} style={{ marginRight: '4px' }} />
                    AUTO {autoRefreshInterval}s {autoRefreshEnabled ? 'ON' : 'OFF'}
                </button>

                {/* Manual Refresh */}
                <button
                    onClick={fetchCoins}
                    className="btn btn-primary"
                    disabled={isLoading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                    }}
                >
                    <FiRefreshCw
                        size={14}
                        style={{
                            animation: isLoading ? 'spin 1s linear infinite' : 'none',
                        }}
                    />
                    REFRESH
                </button>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </header>
    );
}
