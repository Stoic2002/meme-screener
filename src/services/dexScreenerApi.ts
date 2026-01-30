// DEX Screener API service with caching

import axios from 'axios';
import { cache } from './cache';
import type { DEXScreenerResponse, PairData } from '../types';

const DEX_SCREENER_BASE_URL = 'https://api.dexscreener.com/latest/dex';
const CACHE_TTL = 60 * 1000; // 1 minute for real-time data

// Search for Solana tokens
export async function searchTokens(query: string): Promise<PairData[]> {
    const cacheKey = `search-${query}`;
    const cached = cache.get<PairData[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get<DEXScreenerResponse>(
            `${DEX_SCREENER_BASE_URL}/search`,
            {
                params: { q: query },
            }
        );

        // Filter for Solana pairs only
        const solanaPairs = response.data.pairs?.filter(
            pair => pair.chainId === 'solana'
        ) || [];

        cache.set(cacheKey, solanaPairs, CACHE_TTL);
        return solanaPairs;
    } catch (error) {
        console.error('Error searching tokens:', error);
        return [];
    }
}

// Get token by address
export async function getTokenByAddress(address: string): Promise<PairData | null> {
    const cacheKey = `token-${address}`;
    const cached = cache.get<PairData>(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get<DEXScreenerResponse>(
            `${DEX_SCREENER_BASE_URL}/tokens/${address}`
        );

        const solanaPair = response.data.pairs?.find(
            pair => pair.chainId === 'solana'
        );

        if (solanaPair) {
            cache.set(cacheKey, solanaPair, CACHE_TTL);
        }
        return solanaPair || null;
    } catch (error) {
        console.error('Error fetching token:', error);
        return null;
    }
}

// Get trending/new Solana tokens
export async function getTrendingSolanaTokens(tokens: string[] = []): Promise<PairData[]> {
    const cacheKey = `trending-solana-${tokens.sort().join('-')}`;
    const cached = cache.get<PairData[]>(cacheKey);
    if (cached) return cached;

    try {
        // Use provided tokens or fallback to a minimal safe list if empty
        // We do typically expect tokens to be passed from the store
        const searches = tokens.length > 0
            ? tokens
            : ['solana', 'meme']; // Minimal fallback just in case

        const results = await Promise.all(
            searches.map(q => searchTokens(q))
        );

        // Flatten and dedupe by pairAddress
        const allPairs = results.flat();
        const uniquePairs = Array.from(
            new Map(allPairs.map(p => [p.pairAddress, p])).values()
        );

        // Sort by 24h volume descending
        const sorted = uniquePairs.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0));

        // Take top 100
        const topPairs = sorted.slice(0, 100);

        cache.set(cacheKey, topPairs, CACHE_TTL);
        return topPairs;
    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        return [];
    }
}

// Get pair info for multiple addresses
export async function getPairsByAddresses(addresses: string[]): Promise<PairData[]> {
    if (addresses.length === 0) return [];

    const pairs: PairData[] = [];

    // Batch requests to avoid rate limiting
    for (const address of addresses) {
        const pair = await getTokenByAddress(address);
        if (pair) pairs.push(pair);
    }

    return pairs;
}

// Get potential "pump" tokens (high volume, recent)
export async function getPumpTokens(): Promise<PairData[]> {
    const cacheKey = 'pump-hunter-tokens';
    const cached = cache.get<PairData[]>(cacheKey);
    if (cached) return cached;

    try {
        // We simulate a "pump feed" by searching for very broad Solana terms 
        // and then filtering for high volume + recent activity
        const strategies = ['solana', 'pump', 'moon', 'pepe', 'bonk'];

        const results = await Promise.all(
            strategies.map(q => searchTokens(q))
        );

        const allPairs = results.flat();

        // Dedup
        const uniquePairs = Array.from(
            new Map(allPairs.map(p => [p.pairAddress, p])).values()
        );

        // Filter and Sort for "Pumps"
        // Logic: High 1h volume OR High 24h volumeChange (if we had it, but we have priceChange)
        // We'll prioritize: 
        // 1. Recent creation (if available, mostly we rely on what we have)
        // 2. High turnover (Volume / Liquidity) -> indicates action

        const pumpCandidates = uniquePairs
            .filter(p => p.chainId === 'solana')
            .filter(p => (p.volume?.h1 || 0) > 1000) // At least $1k volume in last hour
            .sort((a, b) => {
                // Calculate a "Pump Score"
                // Volume / Liquidity ratio is a good indicator of volatility/pump
                const volA = a.volume?.h1 || 0;
                const liqA = a.liquidity?.usd || 1; // avoid div by 0
                const ratioA = volA / liqA;

                const volB = b.volume?.h1 || 0;
                const liqB = b.liquidity?.usd || 1;
                const ratioB = volB / liqB;

                return ratioB - ratioA; // Descending
            });

        // Take top 50
        const topPumps = pumpCandidates.slice(0, 50);

        cache.set(cacheKey, topPumps, 30 * 1000); // 30s cache for pumps
        return topPumps;
    } catch (error) {
        console.error('Error fetching pump tokens:', error);
        return [];
    }
}

export const dexScreenerApi = {
    searchTokens,
    getTokenByAddress,
    getTrendingSolanaTokens,
    getPairsByAddresses,
    getPumpTokens,
};
