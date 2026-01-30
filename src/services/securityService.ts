// Service to check token security and "rug" potential
// Uses RugCheck.xyz API (public free tier)

import axios from 'axios';

const RUGCHECK_API_URL = 'https://api.rugcheck.xyz/v1/tokens';

export interface SecurityReport {
    score: number; // 0-100 (Lower is better usually, but RugCheck uses specific ranges)
    riskLevel: 'good' | 'warning' | 'danger';
    isLiquidityLocked: boolean;
    isMintable: boolean;
    isFreezable: boolean;
    topHolders: {
        address: string;
        pct: number;
    }[];
    rugged: boolean;
}

// Simple in-memory cache to avoid rate limits
const securityCache = new Map<string, { report: SecurityReport; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function checkTokenSecurity(tokenAddress: string): Promise<SecurityReport | null> {
    // Check cache
    const cached = securityCache.get(tokenAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.report;
    }

    try {
        const response = await axios.get(`${RUGCHECK_API_URL}/${tokenAddress}/report/summary`);

        // RugCheck API structure might vary, adapting to a common shape
        // Based on public docs/observation:
        // response.data usually contains { score, tokenProgram, risks, ... }

        const data = response.data;

        const score = data.score || 0;
        let riskLevel: SecurityReport['riskLevel'] = 'good';
        if (score > 1000) riskLevel = 'danger'; // RugCheck scores can be high for bad tokens
        else if (score > 400) riskLevel = 'warning';

        // Determine liquidity lock (simplified heuristic if specific field missing)
        // Ideally we look for 'Liquidity' risk in the risks array
        const risks = data.risks || [];
        const isLiquidityLocked = !risks.some((r: any) => r.name.includes('Liquidity Unlocked'));
        const isMintable = risks.some((r: any) => r.name.includes('Mint Authority'));
        const isFreezable = risks.some((r: any) => r.name.includes('Freeze Authority'));

        const report: SecurityReport = {
            score,
            riskLevel,
            isLiquidityLocked,
            isMintable,
            isFreezable,
            topHolders: [], // Full holder analysis requires fetching details endpoint
            rugged: data.rugged || false,
        };

        securityCache.set(tokenAddress, { report, timestamp: Date.now() });
        return report;
    } catch (error) {
        console.warn(`Failed to check security for ${tokenAddress}`, error);
        // Return null to indicate "Unknown" rather than "Safe"
        return null;
    }
}
