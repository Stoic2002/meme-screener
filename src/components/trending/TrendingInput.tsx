// Trending keywords input component

import { useState } from 'react';
import { FiPlus, FiX, FiHash, FiRefreshCw } from 'react-icons/fi';
import { useTrendingStore, useCoinStore } from '../../stores';
import { toast } from '../common';

export function TrendingInput() {
    const [inputValue, setInputValue] = useState('');
    const { keywords, addKeyword, removeKeyword, toggleKeyword, resetToDefaults } = useTrendingStore();
    const { setTrendingKeywords, fetchCoins } = useCoinStore();

    const handleAddKeyword = () => {
        const keyword = inputValue.trim();
        if (!keyword) return;

        if (keywords.some(k => k.keyword.toLowerCase() === keyword.toLowerCase())) {
            toast.warning(`"${keyword}" already added`);
            return;
        }

        addKeyword(keyword);
        const activeKeywords = [...keywords.filter(k => k.isActive).map(k => k.keyword), keyword];
        setTrendingKeywords(activeKeywords);
        fetchCoins();
        setInputValue('');
        toast.success(`Added "${keyword}"`);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddKeyword();
        }
    };

    const handleToggle = (id: string) => {
        toggleKeyword(id);
        const activeKeywords = keywords
            .map(k => k.id === id ? { ...k, isActive: !k.isActive } : k)
            .filter(k => k.isActive)
            .map(k => k.keyword);
        setTrendingKeywords(activeKeywords);
        fetchCoins();
    };

    const handleRemove = (id: string, keyword: string) => {
        removeKeyword(id);
        const activeKeywords = keywords.filter(k => k.id !== id && k.isActive).map(k => k.keyword);
        setTrendingKeywords(activeKeywords);
        toast.info(`Removed "${keyword}"`);
    };

    const handleReset = () => {
        resetToDefaults();
        const { keywords: newKeywords } = useTrendingStore.getState();
        setTrendingKeywords(newKeywords.map(k => k.keyword));
        fetchCoins();
        toast.success('Reset to default keywords');
    };

    const activeCount = keywords.filter(k => k.isActive).length;

    return (
        <div className="card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2
                    className="font-pixel"
                    style={{
                        fontSize: '12px',
                        color: 'var(--color-accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <FiHash size={16} />
                    KEYWORD TRACKING
                </h2>
                <button
                    onClick={handleReset}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <FiRefreshCw size={12} />
                    RESET
                </button>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Keywords are auto-loaded for Solana meme coins. Add custom keywords or toggle existing ones.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-safe-bg)',
                    border: '2px solid var(--color-safe)',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-safe)' }}>{activeCount}</span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>ACTIVE</span>
                </div>
                <div style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '2px solid var(--color-border)',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>{keywords.length}</span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>TOTAL</span>
                </div>
            </div>

            {/* Add Custom Keyword */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                    type="text"
                    className="input"
                    placeholder="Add custom keyword..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ flex: 1 }}
                />
                <button
                    onClick={handleAddKeyword}
                    className="btn btn-primary"
                    disabled={!inputValue.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <FiPlus size={14} />
                    ADD
                </button>
            </div>

            {/* Keywords Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                {keywords.map((keyword) => (
                    <div
                        key={keyword.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            backgroundColor: keyword.isActive
                                ? 'var(--color-tier-monitor-bg)'
                                : 'var(--color-bg-secondary)',
                            border: `2px solid ${keyword.isActive ? 'var(--color-accent-cyan)' : 'var(--color-border)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            opacity: keyword.isActive ? 1 : 0.5,
                        }}
                        onClick={() => handleToggle(keyword.id)}
                    >
                        <span
                            style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                color: keyword.isActive ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)',
                                textDecoration: keyword.isActive ? 'none' : 'line-through',
                            }}
                        >
                            {keyword.keyword}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(keyword.id, keyword.keyword);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                padding: '0',
                                display: 'flex',
                                opacity: 0.7,
                            }}
                        >
                            <FiX size={10} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
