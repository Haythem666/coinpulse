import Link from 'next/link';
import Image from 'next/image';
import { CoinMarket } from '@/lib/api';
import { formatPrice, formatLargeNumber, formatChange, formatSupply } from '@/lib/formatters';
import SparklineChart from './SparklineChart';
import ChangeDisplay from './ChangeDisplay';

interface CoinCardProps {
  coin: CoinMarket;
}

export default function CoinCard({ coin }: CoinCardProps) {
  return (
    <Link href={`/coins/${coin.id}`}>
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
          <div className="change">
            <ChangeDisplay value={coin.price_change_percentage_24h} />
            {coin.sparkline_in_7d?.price && (
              <SparklineChart
                data={coin.sparkline_in_7d.price}
                positive={coin.price_change_percentage_24h >= 0}
              />
            )}
          </div>
        </div>

        <div className="stats">
          <div className="stat-row">
            <span className="label">Market Cap</span>
            <span className="value">{formatLargeNumber(coin.market_cap)}</span>
          </div>
          <div className="stat-row">
            <span className="label">Volume 24h</span>
            <span className="value">{formatLargeNumber(coin.total_volume)}</span>
          </div>
          <div className="stat-row">
            <span className="label">Circulating Supply</span>
            <span className="value">
              {formatSupply(coin.circulating_supply)} {coin.symbol.toUpperCase()}
            </span>
          </div>
          <div className="stat-row">
            <span className="label">Market Cap Change</span>
            <span
              className={`value ${coin.market_cap_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {formatChange(coin.market_cap_change_percentage_24h)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
