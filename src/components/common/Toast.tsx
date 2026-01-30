// Toast notification component

import { useState } from 'react';
import { FiX, FiCheck, FiAlertTriangle, FiInfo } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
}

// Global toast state
let toastState: ToastState | null = null;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Store globally for toast() function
    toastState = { toasts, addToast, removeToast };

    return { toasts, addToast, removeToast };
}

// Global toast function
export const toast = {
    success: (message: string) => toastState?.addToast(message, 'success'),
    error: (message: string) => toastState?.addToast(message, 'error'),
    warning: (message: string) => toastState?.addToast(message, 'warning'),
    info: (message: string) => toastState?.addToast(message, 'info'),
};

const iconMap = {
    success: FiCheck,
    error: FiX,
    warning: FiAlertTriangle,
    info: FiInfo,
};

const colorMap = {
    success: 'var(--color-safe)',
    error: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    info: 'var(--color-accent-cyan)',
};

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        }}>
            {toasts.map(toast => {
                const Icon = iconMap[toast.type];
                const color = colorMap[toast.type];

                return (
                    <div
                        key={toast.id}
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            border: `3px solid ${color}`,
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            color,
                            minWidth: '250px',
                            animation: 'slideIn 0.2s ease-out',
                        }}
                    >
                        <Icon size={16} />
                        <span style={{ flex: 1 }}>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                padding: '2px',
                            }}
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                );
            })}
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
