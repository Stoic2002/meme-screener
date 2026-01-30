// Formatting utility functions

// Format price with appropriate precision
export function formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '$0.00';

    if (num < 0.00001) {
        return `$${num.toExponential(2)}`;
    } else if (num < 0.01) {
        return `$${num.toFixed(6)}`;
    } else if (num < 1) {
        return `$${num.toFixed(4)}`;
    } else if (num < 1000) {
        return `$${num.toFixed(2)}`;
    } else {
        return `$${formatCompactNumber(num)}`;
    }
}

// Format large numbers (e.g., 1.5M, 2.3B)
export function formatCompactNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
}

// Format volume
export function formatVolume(volume: number): string {
    return `$${formatCompactNumber(volume)}`;
}

// Format percentage with color indicator
export function formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// Format time ago
export function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
}

// Truncate address for display
export function truncateAddress(address: string, chars: number = 4): string {
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Format liquidity
export function formatLiquidity(liquidity?: { usd: number }): string {
    if (!liquidity?.usd) return 'N/A';
    return formatVolume(liquidity.usd);
}
