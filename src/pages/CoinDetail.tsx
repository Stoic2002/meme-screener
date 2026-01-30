// Coin Detail Page

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiCheck, FiExternalLink, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Container } from '../components/layout';
import { CopyButton, Skeleton, toast, JupiterSwap } from '../components/common';
import { TierBadge, ScamScore, RiskCheck } from '../components/coins';
import { PriceChart } from '../components/charts';
import { dexScreenerApi, getTradingLinks } from '../services';
import { processCoin, formatPrice, formatVolume, formatPercentage, formatLiquidity } from '../utils';
import { useWatchlistStore, useTrendingStore } from '../stores';
import type { ProcessedCoin } from '../types';

export function CoinDetail() {
    const { address } = useParams<{ address: string }>();
    const [coin, setCoin] = useState<ProcessedCoin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
    const { getActiveKeywords } = useTrendingStore();

    const inWatchlist = address ? isInWatchlist(address) : false;

    useEffect(() => {
        if (!address) return;

        const fetchCoin = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const pair = await dexScreenerApi.getTokenByAddress(address);
                if (pair) {
                    const keywords = getActiveKeywords();
                    setCoin(processCoin(pair, keywords));
                } else {
                    setError('Token not found');
                }
            } catch (err) {
                setError('Failed to fetch token data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoin();
    }, [address, getActiveKeywords]);

    const handleWatchlistToggle = () => {
        if (!coin) return;

        if (inWatchlist) {
            removeFromWatchlist(coin.baseToken.address);
            toast.info('Removed from watchlist');
        } else {
            addToWatchlist(coin);
            toast.success('Added to watchlist!');
        }
    };

    if (isLoading) {
        return (
            <Container>
                <Skeleton width={200} height={32} />
                <div style={{ marginTop: 24 }}>
                    <Skeleton width="100%" height={300} />
                </div>
            </Container>
        );
    }

    if (error || !coin) {
        return (
            <Container>
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <h2 className="font-pixel" style={{ fontSize: '14px', marginBottom: '8px' }}>
                        {error || 'Token Not Found'}
                    </h2>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '16px', textDecoration: 'none' }}>
                        ← BACK TO HOME
                    </Link>
                </div>
            </Container>
        );
    }

    const priceChange1h = coin.priceChange?.h1 || 0;
    const priceChange24h = coin.priceChange?.h24 || 0;

    return (
        <Container>
            {/* Back Button */}
            <Link
                to="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    fontSize: '12px',
                    marginBottom: '16px',
                }}
            >
                <FiArrowLeft size={14} />
                BACK TO PUMP DETECTOR
            </Link>

            {/* Header */}
            <div
                className="card"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '24px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: 'var(--color-bg-hover)',
                            border: '3px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 className="font-pixel" style={{ fontSize: '18px' }}>
                                {coin.baseToken.symbol}
                            </h1>
                            <TierBadge tier={coin.tier} />
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {coin.baseToken.name}
                        </p>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div
                        style={{
                            fontSize: '32px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {formatPrice(coin.priceUsd)}
                    </div>
                    <span
                        style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: priceChange24h >= 0 ? 'var(--color-safe)' : 'var(--color-danger)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        {priceChange24h >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        {formatPercentage(priceChange24h)} (24h)
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button
                    onClick={handleWatchlistToggle}
                    className={inWatchlist ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {inWatchlist ? <FiCheck size={14} /> : <FiPlus size={14} />}
                    {inWatchlist ? 'IN WATCHLIST' : 'ADD TO WATCHLIST'}
                </button>
                {coin.url && (
                    <a
                        href={coin.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                    >
                        <FiExternalLink size={14} />
                        VIEW ON DEX SCREENER
                    </a>
                )}
            </div>

            {/* Quick Buy Links */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {coin && getTradingLinks(coin.baseToken.address).map((bot) => (
                    <a
                        key={bot.name}
                        href={bot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: `1px solid ${bot.color}40`,
                            color: 'var(--color-text-primary)'
                        }}
                    >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: bot.color }} />
                        Buy on {bot.name}
                    </a>
                ))}
            </div>

            {/* Jupiter Swap Widget */}
            <div style={{ marginBottom: '24px' }}>
                <JupiterSwap outputMint={coin.baseToken.address} />
            </div>

            {/* Main Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '24px',
                }}
            >
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Chart */}
                    <div className="card">
                        <h3 style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
                            PRICE CHART (30D)
                        </h3>
                        <PriceChart height={250} />
                    </div>

                    {/* Contract Info */}
                    <div className="card">
                        <h3 style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
                            CONTRACT ADDRESS
                        </h3>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                backgroundColor: 'var(--color-bg-secondary)',
                                padding: '12px',
                                border: '2px solid var(--color-border)',
                            }}
                        >
                            <code style={{ flex: 1, fontSize: '11px', wordBreak: 'break-all' }}>
                                {coin.baseToken.address}
                            </code>
                            <CopyButton text={coin.baseToken.address} />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Stats Grid */}
                    <div className="card">
                        <h3 style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
                            MARKET DATA
                        </h3>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '16px',
                            }}
                        >
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                                    1H CHANGE
                                </span>
                                <span
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: priceChange1h >= 0 ? 'var(--color-safe)' : 'var(--color-danger)',
                                    }}
                                >
                                    {formatPercentage(priceChange1h)}
                                </span>
                            </div>
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                                    24H VOLUME
                                </span>
                                <span style={{ fontSize: '16px', fontWeight: 700 }}>
                                    {formatVolume(coin.volume?.h24 || 0)}
                                </span>
                            </div>
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                                    LIQUIDITY
                                </span>
                                <span style={{ fontSize: '16px', fontWeight: 700 }}>
                                    {formatLiquidity(coin.liquidity)}
                                </span>
                            </div>
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                                    MARKET CAP
                                </span>
                                <span style={{ fontSize: '16px', fontWeight: 700 }}>
                                    {coin.marketCap ? formatVolume(coin.marketCap) : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                                    DEX
                                </span>
                                <span style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {coin.dexId}
                                </span>
                            </div>
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                                    PAIR
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 700 }}>
                                    {coin.baseToken.symbol}/{coin.quoteToken.symbol}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Scam Score */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                                SCAM ANALYSIS
                            </h3>
                            {coin && <RiskCheck tokenAddress={coin.baseToken.address} />}
                        </div>
                        <ScamScore score={coin.scamScore} />
                    </div>

                    {/* Transaction Stats */}
                    <div className="card">
                        <h3 style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
                            TRADING ACTIVITY (24H)
                        </h3>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <span
                                    style={{
                                        display: 'block',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        color: 'var(--color-safe)',
                                    }}
                                >
                                    {coin.txns?.h24?.buys || 0}
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>BUYS</span>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <span
                                    style={{
                                        display: 'block',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        color: 'var(--color-danger)',
                                    }}
                                >
                                    {coin.txns?.h24?.sells || 0}
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>SELLS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}
