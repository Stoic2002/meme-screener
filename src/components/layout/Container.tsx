// Container wrapper for pages

import type { ReactNode } from 'react';

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
    return (
        <main
            className={className}
            style={{
                padding: '24px',
                minHeight: 'calc(100vh - 130px)', // Account for header + tabs
                backgroundColor: 'var(--color-bg-primary)',
            }}
        >
            {children}
        </main>
    );
}
