// Skeleton loader for loading states

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    className?: string;
}

export function Skeleton({ width = '100%', height = '20px', className = '' }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: 0, // Blocky, Minecraft style
            }}
        />
    );
}

// Skeleton card for coin loading
export function CoinCardSkeleton() {
    return (
        <div className="card" style={{ height: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Skeleton width={40} height={40} />
                    <div>
                        <Skeleton width={100} height={16} />
                        <Skeleton width={60} height={12} className="mt-1" />
                    </div>
                </div>
                <Skeleton width={60} height={24} />
            </div>
            <Skeleton width="100%" height={24} />
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <Skeleton width="33%" height={16} />
                <Skeleton width="33%" height={16} />
                <Skeleton width="33%" height={16} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Skeleton width="50%" height={32} />
                <Skeleton width="50%" height={32} />
            </div>
        </div>
    );
}
