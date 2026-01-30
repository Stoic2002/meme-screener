// Component to check and display token risk from RugCheck
import { useState } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiLoader, FiXCircle } from 'react-icons/fi';
import { checkTokenSecurity, type SecurityReport } from '../../services/securityService';
import { Tooltip } from '../common';

interface RiskCheckProps {
    tokenAddress: string;
}

export function RiskCheck({ tokenAddress }: RiskCheckProps) {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<SecurityReport | null>(null);
    const [error, setError] = useState(false);

    const handleCheck = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        setError(false);
        try {
            const data = await checkTokenSecurity(tokenAddress);
            if (data) {
                setReport(data);
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                <FiXCircle size={12} color="var(--color-danger)" />
                <span>Failed</span>
                <button
                    onClick={handleCheck}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-accent-blue)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (report) {
        const color = report.riskLevel === 'good' ? 'var(--color-safe)' :
            report.riskLevel === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)';
        const Icon = report.riskLevel === 'good' ? FiCheckCircle : FiAlertTriangle;

        return (
            <Tooltip content={`Score: ${report.score} | Rugged: ${report.rugged ? 'YES' : 'No'} | Liquidity Locked: ${report.isLiquidityLocked ? 'Yes' : 'No'}`}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: color,
                        backgroundColor: `${color}15`,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${color}40`,
                        cursor: 'help'
                    }}
                >
                    <Icon size={12} />
                    <span style={{ textTransform: 'capitalize' }}>{report.riskLevel}</span>
                </div>
            </Tooltip>
        );
    }

    return (
        <button
            onClick={handleCheck}
            disabled={loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                color: 'var(--color-text-secondary)',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
            }}
            onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
        >
            {loading ? <FiLoader className="spin" size={12} /> : <FiShield size={12} />}
            {loading ? 'Checking...' : 'Check Risk'}
        </button>
    );
}
