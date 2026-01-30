// Trending keywords types

export interface TrendingKeyword {
    id: string;
    keyword: string;
    source: 'twitter' | 'tiktok' | 'custom' | 'coingecko';
    addedAt: number;
    isActive: boolean;
}

export interface TrendingMatch {
    keyword: string;
    coinAddress: string;
    matchType: 'name' | 'symbol' | 'partial';
}
