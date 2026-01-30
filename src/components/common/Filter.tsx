// Filter controls component

import { useCoinStore } from '../../stores';
import type { TierType } from '../../types';

export function Filter() {
    const { filters, setFilters } = useCoinStore();

    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
        }}>
            {/* Tier Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>TIER:</span>
                <select
                    value={filters.tier}
                    onChange={(e) => setFilters({ tier: e.target.value as TierType | 'all' })}
                    className="input"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                >
                    <option value="all">All</option>
                    <option value="hot">🔥 Hot</option>
                    <option value="watch">⚠️ Watch</option>
                    <option value="monitor">📊 Monitor</option>
                </select>
            </div>

            {/* Score Range Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>SCORE:</span>
                <select
                    value={`${filters.scoreRange[0]}-${filters.scoreRange[1]}`}
                    onChange={(e) => {
                        const [min, max] = e.target.value.split('-').map(Number);
                        setFilters({ scoreRange: [min, max] });
                    }}
                    className="input"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                >
                    <option value="0-100">All Scores</option>
                    <option value="80-100">Safe (80-100)</option>
                    <option value="50-79">Warning (50-79)</option>
                    <option value="0-49">Danger (0-49)</option>
                </select>
            </div>

            {/* Age Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>AGE:</span>
                <select
                    value={filters.age}
                    onChange={(e) => setFilters({ age: e.target.value as 'all' | '1m' | '5m' | '30m' | '1h' | '2h' | '6h' | '24h' })}
                    className="input"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                >
                    <option value="all">All</option>
                    <option value="1m">⚡ &lt;1m</option>
                    <option value="5m">🚀 &lt;5m</option>
                    <option value="30m">🔥 &lt;30m</option>
                    <option value="1h">&lt;1h</option>
                    <option value="2h">&lt;2h</option>
                    <option value="6h">&lt;6h</option>
                    <option value="24h">&lt;24h</option>
                </select>
            </div>
        </div>
    );
}
