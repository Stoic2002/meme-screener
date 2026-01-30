
import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface JupiterSwapProps {
    outputMint?: string;
}

declare global {
    interface Window {
        Jupiter: {
            init: (config: JupiterPluginConfig) => void;
            close: () => void;
            syncProps: (props: { passthroughWalletContextState: WalletContextState }) => void;
        };
    }
}

interface WalletContextState {
    publicKey: any;
    connected: boolean;
    signTransaction: any;
    signAllTransactions: any;
    signMessage: any;
    wallet: any;
}

interface JupiterPluginConfig {
    displayMode: 'integrated' | 'modal' | 'widget';
    integratedTargetId?: string;
    enableWalletPassthrough?: boolean;
    passthroughWalletContextState?: WalletContextState;
    onRequestConnectWallet?: () => void | Promise<void>;
    formProps?: {
        initialOutputMint?: string;
        initialInputMint?: string;
        fixedMint?: string;
    };
    onSuccess?: (data: { txid: string }) => void;
    onSwapError?: (data: { error: any }) => void;
}

export function JupiterSwap({ outputMint }: JupiterSwapProps) {
    const wallet = useWallet();
    const { setVisible } = useWalletModal();
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // Create wallet context state for passthrough
    const walletContextState: WalletContextState = {
        publicKey: wallet.publicKey,
        connected: wallet.connected,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
        signMessage: wallet.signMessage,
        wallet: wallet.wallet,
    };

    const handleConnectWallet = useCallback(() => {
        setVisible(true);
    }, [setVisible]);

    const initPlugin = useCallback(() => {
        if (!window.Jupiter) return false;

        try {
            window.Jupiter.init({
                displayMode: 'integrated',
                integratedTargetId: 'jupiter-plugin',
                // Enable wallet passthrough to use our wallet connection
                enableWalletPassthrough: true,
                passthroughWalletContextState: walletContextState,
                onRequestConnectWallet: handleConnectWallet,
                formProps: {
                    initialOutputMint: outputMint,
                    initialInputMint: 'So11111111111111111111111111111111111111112', // SOL
                    fixedMint: outputMint, // Lock output to this token
                },
                onSuccess: ({ txid }) => {
                    console.log('✅ Swap successful:', txid);
                },
                onSwapError: ({ error }) => {
                    console.error('❌ Swap failed:', error);
                },
            });
            return true;
        } catch (e) {
            console.error("Jupiter Plugin Init Error:", e);
            return false;
        }
    }, [outputMint, walletContextState, handleConnectWallet]);

    // Initialize plugin
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        let attempts = 0;
        const MAX_ATTEMPTS = 50;

        const checkAndInit = () => {
            if (window.Jupiter) {
                if (initPlugin()) {
                    setIsLoaded(true);
                    clearInterval(intervalId);
                }
            } else {
                attempts++;
                if (attempts >= MAX_ATTEMPTS) {
                    setLoadError(true);
                    clearInterval(intervalId);
                }
            }
        };

        intervalId = setInterval(checkAndInit, 200);

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (window.Jupiter?.close) {
                try {
                    window.Jupiter.close();
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, []);

    // Sync wallet state changes to Jupiter Plugin
    useEffect(() => {
        if (isLoaded && window.Jupiter?.syncProps) {
            window.Jupiter.syncProps({
                passthroughWalletContextState: walletContextState
            });
        }
    }, [isLoaded, wallet.publicKey, wallet.connected]);

    return (
        <div
            className="card"
            style={{
                minHeight: '520px',
                padding: '0',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#131313'
            }}
        >
            {!isLoaded && !loadError && (
                <div style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid var(--color-border)',
                        borderTopColor: 'var(--color-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    Loading Jupiter Plugin...
                </div>
            )}

            {loadError && (
                <div style={{
                    color: 'var(--color-danger)',
                    fontSize: '12px',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    ❌ Failed to load Jupiter Plugin.<br />
                    Please refresh the page.
                </div>
            )}

            <div
                id="jupiter-plugin"
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '480px',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            />
        </div>
    );
}
