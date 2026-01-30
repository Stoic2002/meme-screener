// Price chart component using TradingView lightweight-charts

import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries, HistogramSeries } from 'lightweight-charts';
import type { IChartApi, Time } from 'lightweight-charts';

interface PriceChartProps {
    priceData?: { time: string; value: number }[];
    volumeData?: { time: string; value: number }[];
    height?: number;
}

// Generate mock price data for demo purposes
function generateMockData(days: number = 30) {
    const priceData: { time: Time; value: number }[] = [];
    const volumeData: { time: Time; value: number; color: string }[] = [];

    let basePrice = Math.random() * 0.001 + 0.0001;
    const now = Date.now();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0] as Time;

        // Random price movement
        const change = (Math.random() - 0.45) * 0.2;
        basePrice = Math.max(0.000001, basePrice * (1 + change));

        priceData.push({
            time: dateStr,
            value: basePrice,
        });

        volumeData.push({
            time: dateStr,
            value: Math.random() * 100000 + 10000,
            color: change >= 0 ? 'rgba(136, 68, 255, 0.5)' : 'rgba(255, 68, 68, 0.3)',
        });
    }

    return { priceData, volumeData };
}

export function PriceChart({ height = 300 }: PriceChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Use mock data
        const mockData = generateMockData();

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#1a1a25' },
                textColor: '#a0a0b0',
                fontFamily: 'JetBrains Mono, monospace',
            },
            grid: {
                vertLines: { color: '#2a2a3a' },
                horzLines: { color: '#2a2a3a' },
            },
            width: chartContainerRef.current.clientWidth,
            height,
            crosshair: {
                vertLine: {
                    color: '#00ccff',
                    labelBackgroundColor: '#12121a',
                },
                horzLine: {
                    color: '#00ccff',
                    labelBackgroundColor: '#12121a',
                },
            },
            rightPriceScale: {
                borderColor: '#2a2a3a',
            },
            timeScale: {
                borderColor: '#2a2a3a',
                timeVisible: true,
            },
        });

        chartRef.current = chart;

        // Add price line using new API
        const lineSeries = chart.addSeries(LineSeries, {
            color: '#00ccff',
            lineWidth: 2,
            priceFormat: {
                type: 'price',
                precision: 8,
                minMove: 0.00000001,
            },
        });
        lineSeries.setData(mockData.priceData);

        // Add volume histogram using new API
        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#8844ff',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
        });
        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });
        volumeSeries.setData(mockData.volumeData);

        // Fit content
        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [height]);

    return (
        <div
            ref={chartContainerRef}
            style={{
                width: '100%',
                border: '3px solid #2a2a3a',
                backgroundColor: '#1a1a25',
            }}
        />
    );
}
