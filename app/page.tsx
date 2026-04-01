import { Suspense } from 'react';
import { getTopCoins, getTrendingCoins, getCategories, getTopGainersLosers } from '@/lib/api';
import CoinCard from '@/components/CoinCard';
import TrendingCoins from '@/components/TrendingCoins';
import CategoriesTable from '@/components/CategoriesTable';
import TopGainersLosers from '@/components/TopGainersLosers';
import PriceChart from '@/components/PriceChart';
import { getCoinMarketChart } from '@/lib/api';
import { formatLargeNumber, formatChange } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const revalidate = 60;

async function HomeContent() {
  const [topCoins, trending, categories, gainersLosers, btcChart] = await Promise.all([
    getTopCoins(1, 6),
    getTrendingCoins(),
    getCategories(10),
    getTopGainersLosers(),
    getCoinMarketChart('bitcoin', 30),
  ]);

  const trendingItems = trending.coins.slice(0, 7).map((c) => c.item);
  const featuredCoin = topCoins[0];

  const btcChange = featuredCoin?.price_change_percentage_24h ?? 0;
  const btcIsUp = btcChange >= 0;

  return (
    <main className="main-container">
      {/* Market overview bar */}
      <div className="flex flex-wrap gap-4 md:gap-8 py-3 px-4 bg-dark-500 rounded-xl text-sm">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-purple-100" />
          <span className="text-purple-100">Market</span>
        </div>
        {topCoins.slice(0, 4).map((coin) => {
          const isUp = coin.price_change_percentage_24h >= 0;
          return (
            <div key={coin.id} className="flex items-center gap-2">
              <span className="font-semibold">{coin.symbol.toUpperCase()}</span>
              <span className="text-purple-100">
                ${coin.current_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                {formatChange(coin.price_change_percentage_24h)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hero: Featured Chart + Trending */}
      <div className="home-grid">
        {/* BTC overview chart — spans 2 cols on xl */}
        <div id="coin-overview" className="xl:col-span-2 p-5">
          <div className="header mb-4">
            {featuredCoin && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredCoin.image} alt={featuredCoin.name} />
                <div className="info">
                  <p>{featuredCoin.symbol.toUpperCase()} / USD</p>
                  <h1>
                    ${featuredCoin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h1>
                </div>
                <span
                  className={`badge text-sm px-2 rounded-md ml-auto ${btcIsUp ? 'badge-up' : 'badge-down'}`}
                >
                  {btcIsUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  {formatChange(btcChange)}
                </span>
              </>
            )}
          </div>
          <PriceChart coinId="bitcoin" initialData={btcChart} coinName="Bitcoin" />
        </div>

        {/* Trending coins */}
        <TrendingCoins coins={trendingItems} />
      </div>

      {/* Top Gainers / Losers + Featured Coin Cards */}
      <div className="home-grid items-start">
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {topCoins.slice(0, 3).map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
        </div>
        <TopGainersLosers gainers={gainersLosers.gainers} losers={gainersLosers.losers} />
      </div>

      {/* Categories table */}
      <CategoriesTable categories={categories} />
    </main>
  );
}

function HomeSkeleton() {
  return (
    <main className="main-container">
      <div className="h-12 skeleton rounded-xl" />
      <div className="home-grid">
        <div id="coin-overview-fallback" className="xl:col-span-2">
          <div className="header p-5">
            <div className="header-image skeleton rounded-full" />
            <div className="info">
              <div className="header-line-sm skeleton rounded" />
              <div className="header-line-lg skeleton rounded mt-2" />
            </div>
          </div>
          <div className="chart p-5">
            <div className="chart-skeleton skeleton" />
          </div>
        </div>
        <div id="trending-coins-fallback" className="py-4">
          <h4 className="px-5">Trending</h4>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="trending-coins-table">
              <div className="name-link px-5 py-3">
                <div className="name-image skeleton" />
                <div className="name-line skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
