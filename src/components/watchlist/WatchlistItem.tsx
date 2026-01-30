// Watchlist item component

import { Link } from 'react-router-dom';
import { FiX, FiExternalLink } from 'react-icons/fi';
import type { WatchlistEntry } from '../../types';
import { formatPrice, formatPercentage } from '../../utils';
import { useWatchlistStore } from '../../stores';
import { TierBadge } from '../coins/TierBadge';
import { ScamScore } from '../coins/ScamScore';
import { toast } from '../common';

interface WatchlistItemProps {
    entry: WatchlistEntry;
}


const signalLabels = {
    whale_selling: '🐋 WHALE',
    volume_drop: '📉 VOL DROP',
    rsi_overbought: '⚠️ RSI HIGH',
};

export function WatchlistItem({ entry }: WatchlistItemProps) {
    const { removeFromWatchlist, updateEntryPrice } = useWatchlistStore();
    const coin = entry.coin;

    const currentPrice = parseFloat(coin.priceUsd);
    const entryPrice = entry.entryPrice || currentPrice;
    const roi = ((currentPrice - entryPrice) / entryPrice) * 100;
    const roiMultiple = currentPrice / entryPrice;

    const handleRemove = () => {
        removeFromWatchlist(coin.baseToken.address);
        toast.info('Removed from watchlist');
    };

    const handleSetEntryPrice = () => {
        const price = prompt('Enter your entry price (USD):');
        if (price && !isNaN(parseFloat(price))) {
            updateEntryPrice(coin.baseToken.address, parseFloat(price));
            toast.success('Entry price updated');
        }
    };

    return (
        <div
            className="card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
            }}
        >
            {/* Exit Signals */}
            {entry.exitSignals.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: entry.exitSignals[0].severity === 'danger'
                            ? 'var(--color-danger-bg)'
                            : 'var(--color-warning-bg)',
                        borderBottom: `2px solid ${entry.exitSignals[0].severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                        padding: '8px 12px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                    }}
                >
                    {entry.exitSignals.map((signal, i) => (
                        <span
                            key={i}
                            style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: signal.severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)',
                            }}
                        >
                            {signalLabels[signal.type]}
                        </span>
                    ))}
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: entry.exitSignals.length > 0 ? '36px' : 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: 'var(--color-bg-hover)',
                            border: '2px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                        }}
                    >
                        {coin.info?.imageUrl ? (
                            <img
                                src={coin.info.imageUrl}
                                alt={coin.baseToken.symbol}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            coin.baseToken.symbol.charAt(0)
                        )}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{coin.baseToken.symbol}</h3>
                        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{coin.baseToken.name}</p>
                    </div>
                </div>
                <TierBadge tier={coin.tier} size="sm" />
            </div>

            {/* Price & ROI */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                        CURRENT PRICE
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>{formatPrice(currentPrice)}</span>
                </div>
                <div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                        ROI
                    </span>
                    <span
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: roi >= 0 ? 'var(--color-safe)' : 'var(--color-danger)',
                        }}
                    >
                        {formatPercentage(roi)} ({roiMultiple.toFixed(2)}x)
                    </span>
                </div>
            </div>

            {/* Take Profit Ladder */}
            <div>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    TAKE PROFIT TARGETS
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[2, 5, 10].map((multiple) => {
                        const targetPrice = entryPrice * multiple;
                        const reached = currentPrice >= targetPrice;
                        return (
                            <div
                                key={multiple}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    textAlign: 'center',
                                    backgroundColor: reached ? 'var(--color-safe-bg)' : 'var(--color-bg-secondary)',
                                    border: `2px solid ${reached ? 'var(--color-safe)' : 'var(--color-border)'}`,
                                }}
                            >
                                <span
                                    style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        color: reached ? 'var(--color-safe)' : 'var(--color-text-primary)',
                                    }}
                                >
                                    {multiple}x
                                </span>
                                <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>
                                    {formatPrice(targetPrice)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Entry Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Entry: {formatPrice(entryPrice)}
                </span>
                <button
                    onClick={handleSetEntryPrice}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '9px' }}
                >
                    SET ENTRY
                </button>
            </div>

            {/* Scam Score */}
            <ScamScore score={coin.scamScore} compact />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                    to={`/coin/${coin.baseToken.address}`}
                    className="btn btn-secondary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                    <FiExternalLink size={12} />
                    DETAILS
                </Link>
                <button
                    onClick={handleRemove}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <FiX size={12} />
                    REMOVE
                </button>
            </div>
        </div>
    );
}
