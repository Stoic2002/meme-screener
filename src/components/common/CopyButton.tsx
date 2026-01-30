// Copy to clipboard button

import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from './Toast';

interface CopyButtonProps {
    text: string;
    label?: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                fontSize: '11px',
            }}
        >
            {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
            {label && <span>{label}</span>}
        </button>
    );
}
