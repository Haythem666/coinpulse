interface SparklineChartProps {
  data: number[];
  positive?: boolean;
  width?: number;
  height?: number;
}

export default function SparklineChart({
  data,
  positive,
  width = 120,
  height = 40,
}: SparklineChartProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const fillD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const isPositive = positive ?? data[data.length - 1] >= data[0];
  const color = isPositive ? '#76da44' : '#ff685f';
  const fillColor = isPositive ? 'rgba(118,218,68,0.1)' : 'rgba(255,104,95,0.1)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={fillD} fill={fillColor} stroke="none" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
