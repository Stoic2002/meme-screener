// Core coin types for DEX Screener data

export interface Token {
    address: string;
    name: string;
    symbol: string;
}

export interface PairData {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: Token;
    quoteToken: Token;
    priceNative: string;
    priceUsd: string;
    liquidity?: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv?: number;
    marketCap?: number;
    pairCreatedAt?: number;
    volume: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    priceChange: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    txns: {
        h24: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        m5: { buys: number; sells: number };
    };
    info?: {
        imageUrl?: string;
        websites?: { label: string; url: string }[];
        socials?: { type: string; url: string }[];
    };
}

export type TierType = 'hot' | 'watch' | 'monitor' | 'none';

export interface ScamParameter {
    id: string;
    name: string;
    description: string;
    passed: boolean;
    weight: number;
}

export interface ScamScore {
    score: number; // 0-100
    status: 'safe' | 'warning' | 'danger';
    parameters: ScamParameter[];
    flags: string[];
}

export interface ProcessedCoin extends PairData {
    tier: TierType;
    scamScore: ScamScore;
    ageMinutes: number;
    volumeChange24h: number;
    matchesTrending: boolean;
    trendingKeywords: string[];
}

export interface DEXScreenerResponse {
    pairs: PairData[] | null;
}
