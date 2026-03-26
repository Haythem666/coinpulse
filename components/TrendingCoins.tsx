import Link from 'next/link';
import Image from 'next/image';
import { TrendingCoinItem } from '@/lib/api';
import { formatChange } from '@/lib/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendingCoinsProps {
  coins: TrendingCoinItem[];
}

export default function TrendingCoins({ coins }: TrendingCoinsProps) {
  return (
    <div id="trending-coins">
      <h4>Trending</h4>
      <div className="trending-coins-table">
        <table className="w-full">
          <tbody>
            {coins.map((coin, index) => {
              const change = coin.data?.price_change_percentage_24h?.usd ?? 0;
              const isUp = change >= 0;
              const price = coin.data?.price ?? 0;

              return (
                <tr key={coin.id} className="border-b border-dark-400/50 last:border-none hover:bg-dark-400/30 transition-all">
                  <td className="name-cell">
                    <Link href={`/coins/${coin.id}`} className="a">
                      <span className="text-purple-100 text-sm w-6">{index + 1}</span>
                      <Image src={coin.small} alt={coin.name} width={36} height={36} className="rounded-full" />
                      <p>{coin.name}</p>
                    </Link>
                  </td>
                  <td className="change-cell">
                    <span className={`price-change ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                      {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                      {formatChange(change)}
                    </span>
                  </td>
                  <td className="price-cell">
                    {price < 0.01
                      ? `$${price.toFixed(6)}`
                      : price < 1
                      ? `$${price.toFixed(4)}`
                      : `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
