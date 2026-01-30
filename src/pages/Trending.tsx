// Trending Page

import { Container } from '../components/layout';
import { TrendingInput } from '../components/trending';
import { CoinList } from '../components/coins';
import { useCoinStore } from '../stores';

export function Trending() {
    const { filteredCoins, isLoading } = useCoinStore();

    // Filter to only show trending matches
    const trendingCoins = filteredCoins.filter(coin => coin.matchesTrending);

    return (
        <Container>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1
                    className="font-pixel"
                    style={{
                        fontSize: '16px',
                        marginBottom: '8px',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    📈 TRENDING TOPICS
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Add trending keywords from social media to find matching coins
                </p>
            </div>

            {/* Trending Input */}
            <div style={{ marginBottom: '24px' }}>
                <TrendingInput />
            </div>

            {/* Matching Coins */}
            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    MATCHING COINS ({trendingCoins.length})
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Coins that match your trending keywords
                </p>
            </div>

            {trendingCoins.length > 0 ? (
                <CoinList coins={trendingCoins} isLoading={isLoading} />
            ) : (
                <div
                    className="card"
                    style={{
                        textAlign: 'center',
                        padding: '48px 20px',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <h3
                        className="font-pixel"
                        style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--color-text-primary)' }}
                    >
                        NO MATCHING COINS
                    </h3>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Add trending keywords above to find matching coins
                    </p>
                </div>
            )}
        </Container>
    );
}
