// Tooltip component

import { useState, type ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '2px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'nowrap',
                        zIndex: 100,
                    }}
                >
                    {content}
                    {/* Arrow */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid var(--color-border)',
                        }}
                    />
                </div>
            )}
        </div>
    );
}
