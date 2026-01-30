// Tab navigation component

import { NavLink } from 'react-router-dom';
import { FiTrendingUp, FiStar, FiHash } from 'react-icons/fi';
import { useWatchlistStore } from '../../stores';

const tabs = [
    { path: '/', label: 'PUMP DETECTOR', icon: FiTrendingUp },
    { path: '/watchlist', label: 'WATCHLIST', icon: FiStar },
    { path: '/trending', label: 'TRENDING', icon: FiHash },
];

export function Tabs() {
    const { entries } = useWatchlistStore();

    return (
        <nav
            style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderBottom: '3px solid var(--color-border)',
                display: 'flex',
                gap: '4px',
                padding: '0 24px',
            }}
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const showBadge = tab.path === '/watchlist' && entries.length > 0;

                return (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            borderBottom: isActive ? '3px solid var(--color-accent-cyan)' : '3px solid transparent',
                            marginBottom: '-3px',
                            color: isActive ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                        })}
                    >
                        <Icon size={16} />
                        {tab.label}
                        {showBadge && (
                            <span
                                style={{
                                    backgroundColor: 'var(--color-accent-purple)',
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                }}
                            >
                                {entries.length}
                            </span>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
}
