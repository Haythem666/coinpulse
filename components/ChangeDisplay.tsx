import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatChange } from '@/lib/formatters';

interface ChangeDisplayProps {
  value: number | null | undefined;
  className?: string;
  showIcon?: boolean;
}

export default function ChangeDisplay({ value, className, showIcon = true }: ChangeDisplayProps) {
  const isUp = (value ?? 0) >= 0;
  return (
    <span
      className={cn(
        'badge text-sm px-2 rounded-md',
        isUp ? 'badge-up' : 'badge-down',
        className
      )}
    >
      {showIcon && (
        isUp
          ? <TrendingUp className="size-3.5" />
          : <TrendingDown className="size-3.5" />
      )}
      {formatChange(value)}
    </span>
  );
}
