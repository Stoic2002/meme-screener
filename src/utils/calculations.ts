// Calculation utilities for tier classification and scam scoring

import type { PairData, TierType, ScamScore, ScamParameter, ProcessedCoin } from '../types';

// Calculate age in minutes from creation timestamp
export function calculateAgeMinutes(pairCreatedAt?: number): number {
    if (!pairCreatedAt) return Infinity;
    return Math.floor((Date.now() - pairCreatedAt) / 60000);
}

// Calculate volume change percentage (approximation based on available data)
export function calculateVolumeChange24h(volume: PairData['volume']): number {
    // Estimate based on 6h volume extrapolated
    const h24 = volume.h24 || 0;
    const h6 = volume.h6 || 0;
    if (h6 === 0) return 0;

    // If current 6h pace continues, compare to last 24h
    const projected = h6 * 4;
    return ((h24 - projected) / projected) * 100;
}

// Classify coin into tier based on volume and price changes
export function classifyTier(pair: PairData): TierType {
    const volume24h = pair.volume?.h24 || 0;
    const priceChange1h = pair.priceChange?.h1 || 0;
    const priceChange24h = pair.priceChange?.h24 || 0;
    const ageMinutes = calculateAgeMinutes(pair.pairCreatedAt);

    // Calculate volume change (estimated)
    const volumeChange = Math.abs(priceChange24h * 10); // Rough estimate

    // 🔥 Hot Tier: Volume 24h >500% + Price >30% in 1h OR New <45min + volume >200%
    if (
        (volumeChange > 500 && priceChange1h > 30) ||
        (ageMinutes < 45 && volumeChange > 200)
    ) {
        return 'hot';
    }

    // ⚠️ Watch Tier: Volume 24h >300% + Price >15% in 1h
    if (volumeChange > 300 && priceChange1h > 15) {
        return 'watch';
    }

    // 📊 Monitor Tier: Volume 24h >200%
    if (volumeChange > 200 || volume24h > 100000) {
        return 'monitor';
    }

    return 'none';
}

// Generate mock scam parameters (since we don't have real on-chain data)
export function generateScamScore(pair: PairData): ScamScore {
    const parameters: ScamParameter[] = [
        {
            id: 'contract_verified',
            name: 'Contract Verified',
            description: 'Contract source code is verified on explorer',
            passed: Math.random() > 0.3, // Mock: 70% chance verified
            weight: 15,
        },
        {
            id: 'liquidity_locked',
            name: 'Liquidity Locked/Burned',
            description: 'Liquidity is locked or burned',
            passed: (pair.liquidity?.usd || 0) > 10000, // Based on actual liquidity
            weight: 20,
        },
        {
            id: 'honeypot',
            name: 'Honeypot Check',
            description: 'Can sell tokens (not a honeypot)',
            passed: Math.random() > 0.2, // Mock: 80% chance not honeypot
            weight: 25,
        },
        {
            id: 'tax_low',
            name: 'Buy/Sell Tax <10%',
            description: 'Trading taxes are below 10%',
            passed: Math.random() > 0.25, // Mock: 75% chance low tax
            weight: 15,
        },
        {
            id: 'ownership_renounced',
            name: 'Ownership Renounced',
            description: 'Contract ownership has been renounced',
            passed: Math.random() > 0.4, // Mock: 60% chance renounced
            weight: 10,
        },
        {
            id: 'top_holders',
            name: 'Top 10 Wallets <50%',
            description: 'Top 10 wallets hold less than 50% of supply',
            passed: Math.random() > 0.35, // Mock: 65% chance good distribution
            weight: 10,
        },
        {
            id: 'mint_disabled',
            name: 'Mint Authority Disabled',
            description: 'Cannot mint new tokens',
            passed: Math.random() > 0.25, // Mock: 75% chance disabled
            weight: 5,
        },
    ];

    // Calculate score
    let score = 0;
    parameters.forEach(p => {
        if (p.passed) score += p.weight;
    });

    // Add liquidity bonus
    const liquidity = pair.liquidity?.usd || 0;
    if (liquidity > 100000) score = Math.min(100, score + 5);
    if (liquidity < 10000) score = Math.max(0, score - 10);

    // Determine status
    let status: ScamScore['status'] = 'danger';
    if (score >= 80) status = 'safe';
    else if (score >= 50) status = 'warning';

    // Generate flags
    const flags: string[] = [];
    const priceChange1h = pair.priceChange?.h1 || 0;
    const priceChange24h = pair.priceChange?.h24 || 0;

    // Flag: Wash trading (high volume, low price change)
    if (Math.abs(priceChange24h * 10) > 500 && Math.abs(priceChange1h) < 5) {
        flags.push('Possible wash trading detected');
    }

    // Flag: Low liquidity
    if (liquidity < 10000) {
        flags.push('Low liquidity (<$10k)');
    }

    // Flag: Top holder concentration (mock)
    if (!parameters.find(p => p.id === 'top_holders')?.passed) {
        flags.push('High holder concentration');
    }

    return { score, status, parameters, flags };
}

// Check if coin matches trending keywords
export function matchesTrendingKeywords(
    pair: PairData,
    keywords: string[]
): { matches: boolean; matchedKeywords: string[] } {
    if (keywords.length === 0) return { matches: false, matchedKeywords: [] };

    const name = pair.baseToken.name.toLowerCase();
    const symbol = pair.baseToken.symbol.toLowerCase();

    const matchedKeywords = keywords.filter(k => {
        const keyword = k.toLowerCase();
        return name.includes(keyword) || symbol.includes(keyword);
    });

    return {
        matches: matchedKeywords.length > 0,
        matchedKeywords,
    };
}

// Process raw pair data into a ProcessedCoin
export function processCoin(
    pair: PairData,
    trendingKeywords: string[] = []
): ProcessedCoin {
    const tier = classifyTier(pair);
    const scamScore = generateScamScore(pair);
    const ageMinutes = calculateAgeMinutes(pair.pairCreatedAt);
    const volumeChange24h = calculateVolumeChange24h(pair.volume);
    const { matches, matchedKeywords } = matchesTrendingKeywords(pair, trendingKeywords);

    return {
        ...pair,
        tier,
        scamScore,
        ageMinutes,
        volumeChange24h,
        matchesTrending: matches,
        trendingKeywords: matchedKeywords,
    };
}

// Calculate RSI (simplified mock version)
export function calculateMockRSI(): number {
    // Return mock RSI value between 20-80 with some variation
    return 30 + Math.random() * 50;
}
