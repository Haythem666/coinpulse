'use client';

import { useState, useCallback } from 'react';
import { MarketChart } from '@/lib/api';
import { formatPrice } from '@/lib/formatters';

interface PriceChartProps {
  coinId: string;
  initialData: MarketChart;
  coinName: string;
}

type Period = '1' | '7' | '30' | '90' | '365';

const PERIODS: { label: string; value: Period }[] = [
  { label: '1D', value: '1' },
  { label: '7D', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
];

function buildPath(prices: [number, number][], width: number, height: number): string {
  if (prices.length < 2) return '';
  const values = prices.map(([, p]) => p);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = height * 0.05;

  const points = prices.map(([, val], i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - pad - ((val - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(' L ')}`;
}

export default function PriceChart({ coinId, initialData, coinName }: PriceChartProps) {
  const [period, setPeriod] = useState<Period>('30');
  const [data, setData] = useState<MarketChart>(initialData);
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; price: number; date: string } | null>(null);

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${p}`
      );
      const json = await res.json();
      setData(json);
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [coinId]);

  const handlePeriod = (p: Period) => {
    setPeriod(p);
    fetchData(p);
  };

  const prices = data.prices ?? [];
  const isPositive = prices.length >= 2 && prices[prices.length - 1][1] >= prices[0][1];
  const color = isPositive ? '#76da44' : '#ff685f';
  const fillId = `fill-${coinId}`;

  const W = 800;
  const H = 300;
  const pathD = buildPath(prices, W, H);
  const fillD = pathD ? `${pathD} L ${W},${H} L 0,${H} Z` : '';

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!prices.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((svgX / W) * (prices.length - 1));
    const safeIdx = Math.max(0, Math.min(prices.length - 1, idx));
    const [ts, price] = prices[safeIdx];
    const values = prices.map(([, p]) => p);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = H * 0.05;
    const y = H - pad - ((price - min) / range) * (H - pad * 2);
    const x = (safeIdx / (prices.length - 1)) * W;
    setTooltip({
      x,
      y,
      price,
      date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
  };

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <span>{coinName} Price Chart</span>
        <div className="button-group">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriod(p.value)}
              className={period === p.value ? 'config-button-active' : 'config-button'}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart relative" style={{ opacity: loading ? 0.5 : 1 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minHeight: 200 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {fillD && <path d={fillD} fill={`url(#${fillId})`} stroke="none" />}
          {pathD && (
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {tooltip && (
            <>
              <line
                x1={tooltip.x}
                y1={0}
                x2={tooltip.x}
                y2={H}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <circle cx={tooltip.x} cy={tooltip.y} r="4" fill={color} />
            </>
          )}
        </svg>

        {tooltip && (
          <div
            className="absolute pointer-events-none bg-dark-400 border border-dark-400/50 rounded-lg px-3 py-2 text-sm"
            style={{
              left: `${(tooltip.x / W) * 100}%`,
              top: `${(tooltip.y / H) * 100}%`,
              transform: 'translate(-50%, -130%)',
            }}
          >
            <p className="text-purple-100">{tooltip.date}</p>
            <p className="font-semibold">{formatPrice(tooltip.price)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
