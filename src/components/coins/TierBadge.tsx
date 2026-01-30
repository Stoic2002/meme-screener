// Tier badge component (Hot/Watch/Monitor)

import type { TierType } from '../../types';

interface TierBadgeProps {
    tier: TierType;
    size?: 'sm' | 'md';
}

const tierConfig: Record<TierType, { label: string; emoji: string; className: string }> = {
    hot: { label: 'HOT', emoji: '🔥', className: 'badge-hot' },
    watch: { label: 'WATCH', emoji: '⚠️', className: 'badge-watch' },
    monitor: { label: 'MONITOR', emoji: '📊', className: 'badge-monitor' },
    none: { label: '', emoji: '', className: '' },
};

export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
    if (tier === 'none') return null;

    const config = tierConfig[tier];
    const padding = size === 'sm' ? '4px 8px' : '6px 12px';
    const fontSize = size === 'sm' ? '9px' : '10px';

    return (
        <span
            className={config.className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding,
                fontSize,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'var(--font-mono)',
            }}
        >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
        </span>
    );
}
