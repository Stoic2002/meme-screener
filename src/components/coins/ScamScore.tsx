// Scam score indicator component

import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import type { ScamScore as ScamScoreType } from '../../types';
import { Tooltip } from '../common';

interface ScamScoreProps {
    score: ScamScoreType;
    compact?: boolean;
}

function getScoreClass(status: ScamScoreType['status']): string {
    switch (status) {
        case 'safe': return 'score-safe';
        case 'warning': return 'score-warning';
        case 'danger': return 'score-danger';
    }
}

function getScoreColor(status: ScamScoreType['status']): string {
    switch (status) {
        case 'safe': return 'var(--color-safe)';
        case 'warning': return 'var(--color-warning)';
        case 'danger': return 'var(--color-danger)';
    }
}

export function ScamScore({ score, compact = false }: ScamScoreProps) {
    const [expanded, setExpanded] = useState(false);

    if (compact) {
        return (
            <Tooltip content={`Scam Score: ${score.score}/100`}>
                <span
                    className={getScoreClass(score.status)}
                    style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    {score.score}
                </span>
            </Tooltip>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            {/* Main Score Display */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: `2px solid ${getScoreColor(score.status)}`,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                        style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: getScoreColor(score.status),
                        }}
                    >
                        {score.score}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        SCAM SCORE
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        className={getScoreClass(score.status)}
                        style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                        }}
                    >
                        {score.status}
                    </span>
                    {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </div>
            </button>

            {/* Expanded Checklist */}
            {expanded && (
                <div
                    style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '2px solid var(--color-border)',
                        borderTop: 'none',
                        padding: '12px',
                    }}
                >
                    {/* Flags */}
                    {score.flags.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                            {score.flags.map((flag, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'var(--color-danger)',
                                        fontSize: '11px',
                                        marginBottom: '6px',
                                    }}
                                >
                                    <FiAlertTriangle size={12} />
                                    <span>{flag}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Parameters Checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {score.parameters.map((param) => (
                            <div
                                key={param.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '11px',
                                }}
                            >
                                <span
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: param.passed
                                            ? 'var(--color-safe-bg)'
                                            : 'var(--color-danger-bg)',
                                        border: `2px solid ${param.passed ? 'var(--color-safe)' : 'var(--color-danger)'}`,
                                    }}
                                >
                                    {param.passed ? (
                                        <FiCheck size={10} color="var(--color-safe)" />
                                    ) : (
                                        <FiX size={10} color="var(--color-danger)" />
                                    )}
                                </span>
                                <Tooltip content={param.description}>
                                    <span
                                        style={{
                                            color: param.passed ? 'var(--color-text-primary)' : 'var(--color-danger)',
                                        }}
                                    >
                                        {param.name}
                                    </span>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
