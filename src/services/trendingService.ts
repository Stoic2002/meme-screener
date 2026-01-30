
interface TrendingCoin {
    item: {
        id: string;
        coin_id: number;
        name: string;
        symbol: string;
        market_cap_rank: number;
        thumb: string;
        small: string;
        large: string;
        slug: string;
        price_btc: number;
        score: number;
    };
}

interface TrendingResponse {
    coins: TrendingCoin[];
    nfts: any[];
    categories: any[];
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/search/trending';

export async function fetchTrendingCoins(): Promise<string[]> {
    try {
        const response = await fetch(COINGECKO_API_URL);
        if (!response.ok) {
            // Fallback or silent fail is acceptable here as we have defaults
            console.warn('Failed to fetch trending coins from CoinGecko');
            return [];
        }
        const data: TrendingResponse = await response.json();

        // Extract symbols and names (we prefer symbols for search usually)
        // We filter for distinct values
        const keywords = data.coins.map(coin => coin.item.symbol.toLowerCase());

        // Also add names if they are short enough (e.g. single word)
        const names = data.coins
            .map(coin => coin.item.name.toLowerCase())
            .filter(name => name.split(' ').length === 1 && name.length < 10); // Simple heuristic

        return Array.from(new Set([...keywords, ...names]));
    } catch (error) {
        console.error('Error fetching trending coins:', error);
        return [];
    }
}
