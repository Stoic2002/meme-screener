// Service to generate deep links for trading bots

export interface TradingBot {
    name: string;
    icon: string; // URL or icon name
    generateUrl: (tokenAddress: string) => string;
    color: string;
}

export const TRADING_BOTS: TradingBot[] = [
    {
        name: 'Trojan',
        icon: 'trojan', // We'll handle icons in the UI component
        // Trojan on Solana (formerly Unibot on Solana)
        generateUrl: (address) => `https://t.me/solana_trojanbot?start=r-antigravity-${address}`,
        // Note: 'antigravity' is a placeholder ref code, or just use `start=${address}` if no ref
        color: '#d97706', // amber-600
    },
    {
        name: 'BonkBot',
        icon: 'bonkbot',
        generateUrl: (address) => `https://t.me/bonkbot_bot?start=ref_antigravity_ca_${address}`,
        color: '#ea580c', // orange-600
    },
    {
        name: 'Photon',
        icon: 'photon',
        generateUrl: (address) => `https://photon-sol.tinyastro.io/en/lp/${address}`,
        color: '#0ea5e9', // sky-500
    },
    {
        name: 'BullX',
        icon: 'bullx',
        generateUrl: (address) => `https://bullx.io/terminal?chainId=1399811149&address=${address}`,
        color: '#10b981', // emerald-500
    }
];

export function getTradingLinks(tokenAddress: string): { name: string; url: string; color: string }[] {
    return TRADING_BOTS.map(bot => ({
        name: bot.name,
        url: bot.generateUrl(tokenAddress),
        color: bot.color,
    }));
}
