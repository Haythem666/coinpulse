'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CoinMarket } from '@/lib/api';
import { formatPrice, formatChange } from '@/lib/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopGainersLosersProps {
  gainers: CoinMarket[];
  losers: CoinMarket[];
}

export default function TopGainersLosers({ gainers, losers }: TopGainersLosersProps) {
  const [tab, setTab] = useState<'gainers' | 'losers'>('gainers');
  const coins = tab === 'gainers' ? gainers : losers;

  return (
    <div id="top-gainers-losers">
      <div className="tabs-list">
        <button
          className={`tabs-trigger ${tab === 'gainers' ? 'text-green-500' : 'text-purple-100'}`}
          onClick={() => setTab('gainers')}
        >
          Top Gainers
        </button>
        <button
          className={`tabs-trigger ${tab === 'losers' ? 'text-red-500' : 'text-purple-100'}`}
          onClick={() => setTab('losers')}
        >
          Top Losers
        </button>
      </div>

      <div className="tabs-content">
        {coins.map((coin) => {
          const isUp = coin.price_change_percentage_24h >= 0;
          return (
            <Link key={coin.id} href={`/coins/${coin.id}`}>
              <div id="coin-card">
                <div className="header">
                  <Image src={coin.image} alt={coin.name} width={48} height={48} />
                  <div>
                    <h3>{coin.name}</h3>
                    <p>{coin.symbol}</p>
                  </div>
                </div>
                <div className="price-row">
                  <span className="price">{formatPrice(coin.current_price)}</span>
                  <span
                    className={`badge text-sm px-2 rounded-md ${isUp ? 'badge-up' : 'badge-down'}`}
                  >
                    {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                    {formatChange(coin.price_change_percentage_24h)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
