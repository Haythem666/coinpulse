import Image from 'next/image';
import { CoinCategory } from '@/lib/api';
import { formatLargeNumber, formatChange } from '@/lib/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CategoriesTableProps {
  categories: CoinCategory[];
}

export default function CategoriesTable({ categories }: CategoriesTableProps) {
  return (
    <div id="categories">
      <h4>Top Categories</h4>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-dark-400/50 text-purple-100 text-sm">
              <th className="category-cell py-3 text-left font-medium">Category</th>
              <th className="change-header-cell py-3 text-left">24h Change</th>
              <th className="market-cap-cell py-3 text-right pr-5">Market Cap</th>
              <th className="volume-cell py-3 text-right pr-5">Volume 24h</th>
              <th className="py-3 pr-5 text-right">Top Coins</th>
            </tr>
          </thead>
          <tbody>
            {categories.slice(0, 10).map((cat) => {
              const isUp = (cat.market_cap_change_24h ?? 0) >= 0;
              return (
                <tr
                  key={cat.id}
                  className="border-b border-dark-400/50 last:border-none hover:bg-dark-400/20 transition-all"
                >
                  <td className="category-cell py-4 pr-4 max-w-48">
                    <span className="truncate block">{cat.name}</span>
                  </td>
                  <td className="py-4">
                    <span className={`change-cell ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                      {isUp ? (
                        <TrendingUp className="size-3.5" />
                      ) : (
                        <TrendingDown className="size-3.5" />
                      )}
                      {formatChange(cat.market_cap_change_24h)}
                    </span>
                  </td>
                  <td className="market-cap-cell py-4 text-right pr-5">
                    {formatLargeNumber(cat.market_cap)}
                  </td>
                  <td className="volume-cell py-4 text-right pr-5">
                    {formatLargeNumber(cat.volume_24h)}
                  </td>
                  <td className="top-gainers-cell py-4 justify-end">
                    {cat.top_3_coins?.slice(0, 3).map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        alt="coin"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    ))}
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
