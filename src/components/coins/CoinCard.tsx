// Coin card component for displaying individual coins
import React from 'react';

import { Link } from 'react-router-dom';
import { FiPlus, FiCheck, FiExternalLink, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import type { ProcessedCoin } from '../../types';
import { formatPrice, formatVolume, formatPercentage, formatTimeAgo } from '../../utils';
import { useWatchlistStore } from '../../stores';
import { getTradingLinks } from '../../services';
import { TierBadge } from './TierBadge';
import { ScamScore } from './ScamScore';
import { RiskCheck } from './RiskCheck';
import { toast } from '../common';

interface CoinCardProps {
    coin: ProcessedCoin;
}

export function CoinCard({ coin }: CoinCardProps) {
    const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlistStore();
    const inWatchlist = isInWatchlist(coin.baseToken.address);

    const priceChange1h = coin.priceChange?.h1 || 0;
    const priceChange24h = coin.priceChange?.h24 || 0;
    const isPositive = priceChange24h >= 0;

    // Flash effect logic
    const [flashClass, setFlashClass] = React.useState('');
    const prevPriceRef = React.useRef(coin.priceUsd);

    React.useEffect(() => {
        if (coin.priceUsd > prevPriceRef.current) {
            setFlashClass('flash-green');
        } else if (coin.priceUsd < prevPriceRef.current) {
            setFlashClass('flash-red');
        }

        // Reset flash class after animation
        const timer = setTimeout(() => setFlashClass(''), 1000);
        prevPriceRef.current = coin.priceUsd;

        return () => clearTimeout(timer);
    }, [coin.priceUsd]);

    const handleWatchlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (inWatchlist) {
            removeFromWatchlist(coin.baseToken.address);
            toast.info('Removed from watchlist');
        } else {
            addToWatchlist(coin);
            toast.success('Added to watchlist!');
        }
    };

    return (
        <div
            className={`card ${flashClass}`}
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* Trending Match Highlight */}
            {coin.matchesTrending && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        backgroundColor: 'var(--color-accent-cyan)',
                    }}
                />
            )}

            {/* Header: Token Info + Tier Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Token Logo */}
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: 'var(--color-bg-hover)',
                            border: '2px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            overflow: 'hidden',
                        }}
                    >
                        {coin.info?.imageUrl ? (
                            <img
                                src={coin.info.imageUrl}
                                alt={coin.baseToken.symbol}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            coin.baseToken.symbol.charAt(0).toUpperCase()
                        )}
                    </div>

                    <div>
                        <h3
                            style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                marginBottom: '2px',
                            }}
                        >
                            {coin.baseToken.symbol}
                        </h3>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {coin.baseToken.name.length > 15
                                ? coin.baseToken.name.substring(0, 15) + '...'
                                : coin.baseToken.name}
                        </p>
                    </div>
                </div>

                <TierBadge tier={coin.tier} size="sm" />
            </div>

            {/* Price */}
            <div style={{ marginBottom: '12px' }}>
                <span
                    style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    {formatPrice(coin.priceUsd)}
                </span>
                <span
                    style={{
                        marginLeft: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isPositive ? 'var(--color-safe)' : 'var(--color-danger)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    {isPositive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
                    {formatPercentage(priceChange24h)}
                </span>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '12px',
                    fontSize: '11px',
                }}
            >
                <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>1H</span>
                    <span
                        style={{
                            color: priceChange1h >= 0 ? 'var(--color-safe)' : 'var(--color-danger)',
                            fontWeight: 600,
                        }}
                    >
                        {formatPercentage(priceChange1h)}
                    </span>
                </div>
                <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>VOLUME</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {formatVolume(coin.volume?.h24 || 0)}
                    </span>
                </div>
                <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>AGE</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {coin.pairCreatedAt ? formatTimeAgo(coin.pairCreatedAt) : 'N/A'}
                    </span>
                </div>
            </div>

            {/* Scam Score */}
            <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <ScamScore score={coin.scamScore} compact />
                </div>
                <RiskCheck tokenAddress={coin.baseToken.address} />
            </div>

            {/* Trending Keywords */}
            {coin.matchesTrending && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {coin.trendingKeywords.slice(0, 2).map((k) => (
                            <span
                                key={k}
                                style={{
                                    backgroundColor: 'var(--color-tier-monitor-bg)',
                                    border: '1px solid var(--color-accent-cyan)',
                                    padding: '2px 6px',
                                    fontSize: '9px',
                                    color: 'var(--color-accent-cyan)',
                                }}
                            >
                                #{k}
                            </span>
                        ))}
                    </div>
                </div>
            )}

// Action Buttons
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleWatchlistToggle}
                        className={inWatchlist ? 'btn btn-secondary' : 'btn btn-primary'}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        {inWatchlist ? <FiCheck size={12} /> : <FiPlus size={12} />}
                        {inWatchlist ? 'SAVED' : 'WATCH'}
                    </button>
                    <Link
                        to={`/coin/${coin.baseToken.address}`}
                        className="btn btn-secondary"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                    >
                        <FiExternalLink size={12} />
                        DETAILS
                    </Link>
                </div>

                {/* Quick Buy Links */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '4px',
                    paddingTop: '4px',
                    borderTop: '1px solid var(--color-border)'
                }}>
                    {getTradingLinks(coin.baseToken.address).slice(0, 3).map((bot) => (
                        <a
                            key={bot.name}
                            href={bot.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6px',
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                color: 'var(--color-text-primary)',
                                fontSize: '10px',
                                fontWeight: 600,
                                border: `1px solid ${bot.color}40`,
                                gap: '4px'
                            }}
                            title={`Trade on ${bot.name}`}
                        >
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: bot.color
                            }} />
                            {bot.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
