import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCoinDetail, getCoinMarketChart } from '@/lib/api';
import { formatPrice, formatLargeNumber, formatChange, formatSupply, formatTime } from '@/lib/formatters';
import PriceChart from '@/components/PriceChart';
import Converter from '@/components/Converter';
import ChangeDisplay from '@/components/ChangeDisplay';
import { ExternalLink, Twitter, Github, MessageCircle, Globe, ArrowLeft } from 'lucide-react';

export const revalidate = 120;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function CoinDetailContent({ id }: { id: string }) {
  let coin;
  let chart;
  try {
    [coin, chart] = await Promise.all([
      getCoinDetail(id),
      getCoinMarketChart(id, 30),
    ]);
  } catch {
    notFound();
  }

  const price = coin.market_data.current_price.usd;
  const change24h = coin.market_data.price_change_percentage_24h;
  const change7d = coin.market_data.price_change_percentage_7d;
  const change30d = coin.market_data.price_change_percentage_30d;

  const topTickers = coin.tickers?.slice(0, 8) ?? [];

  return (
    <div id="coin-details-page">
      {/* Primary column */}
      <div className="primary">
        <div id="coin-header">
          <Link href="/coins" className="flex items-center gap-1 text-purple-100 hover:text-white text-sm mb-4 w-fit">
            <ArrowLeft className="size-4" />
            All coins
          </Link>

          <div className="info">
            <Image src={coin.image.large} alt={coin.name} width={77} height={77} className="rounded-full" />
            <div>
              <h3>{coin.name}</h3>
              <p className="text-purple-100 text-sm uppercase">{coin.symbol}</p>
            </div>
            <span className="bg-dark-500 text-purple-100 text-sm px-3 py-1 rounded-full">
              #{coin.market_cap_rank}
            </span>
          </div>

          <div className="price-row mt-4">
            <h1>{formatPrice(price)}</h1>
            <ChangeDisplay value={change24h} className="self-end mb-2" />
          </div>

          <ul className="stats">
            <li className="pr-4 sm:pr-6">
              <span className="label">Market Cap</span>
              <span className="value">{formatLargeNumber(coin.market_data.market_cap.usd)}</span>
            </li>
            <li className="px-4 sm:px-6">
              <span className="label">Volume 24h</span>
              <span className="value">{formatLargeNumber(coin.market_data.total_volume.usd)}</span>
            </li>
            <li className="pl-4 sm:pl-6">
              <span className="label">Circulating Supply</span>
              <span className="value">
                {formatSupply(coin.market_data.circulating_supply)} {coin.symbol.toUpperCase()}
              </span>
            </li>
          </ul>
        </div>

        {/* Price chart */}
        <div className="mt-6">
          <PriceChart coinId={id} initialData={chart} coinName={coin.name} />
        </div>

        {/* Exchange tickers */}
        {topTickers.length > 0 && (
          <div className="exchange-section">
            <h4>Markets</h4>
            <div className="exchange-table custom-scrollbar">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-dark-400/50 text-purple-100 text-sm">
                      <th className="pl-5 py-4 text-left font-medium">Exchange</th>
                      <th className="py-4 text-left font-medium">Pair</th>
                      <th className="py-4 text-right font-medium pr-5">Price</th>
                      <th className="py-4 text-right font-medium pr-5 hidden md:table-cell">Volume</th>
                      <th className="py-4 text-right font-medium pr-5 hidden md:table-cell">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTickers.map((ticker, i) => (
                      <tr
                        key={i}
                        className="border-b border-dark-400/40 last:border-none hover:bg-dark-400/20 transition-all relative"
                      >
                        <td className="exchange-name pl-5 py-4 relative">
                          {ticker.trade_url && (
                            <a href={ticker.trade_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                          )}
                          {ticker.market.name}
                        </td>
                        <td className="pair">
                          <p>{ticker.base}</p>
                          <span className="text-purple-100">/</span>
                          <p>{ticker.target}</p>
                        </td>
                        <td className="price-cell text-right pr-5">
                          ${ticker.last.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                        </td>
                        <td className="price-cell text-right pr-5 hidden md:table-cell">
                          ${ticker.volume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="time-cell hidden md:table-cell">
                          {formatTime(ticker.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secondary column */}
      <div className="secondary">
        {/* Converter */}
        <Converter coin={coin} />

        {/* Coin details */}
        <div className="details mt-8">
          <h4>Details</h4>
          <ul className="details-grid">
            <li>
              <span className="label">24h High</span>
              <span className="font-semibold">{formatPrice(coin.market_data.high_24h.usd)}</span>
            </li>
            <li>
              <span className="label">24h Low</span>
              <span className="font-semibold">{formatPrice(coin.market_data.low_24h.usd)}</span>
            </li>
            <li>
              <span className="label">All-Time High</span>
              <span className="font-semibold">{formatPrice(coin.market_data.ath.usd)}</span>
            </li>
            <li>
              <span className="label">All-Time Low</span>
              <span className="font-semibold">{formatPrice(coin.market_data.atl.usd)}</span>
            </li>
            <li>
              <span className="label">7d Change</span>
              <ChangeDisplay value={change7d} showIcon={false} />
            </li>
            <li>
              <span className="label">30d Change</span>
              <ChangeDisplay value={change30d} showIcon={false} />
            </li>
            <li>
              <span className="label">Max Supply</span>
              <span className="font-semibold">
                {formatSupply(coin.market_data.max_supply)} {coin.symbol.toUpperCase()}
              </span>
            </li>
            <li>
              <span className="label">Total Supply</span>
              <span className="font-semibold">
                {formatSupply(coin.market_data.total_supply)} {coin.symbol.toUpperCase()}
              </span>
            </li>

            {/* Links */}
            {coin.links.homepage?.[0] && (
              <li>
                <span className="label">Website</span>
                <a
                  href={coin.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  <Globe className="size-4" />
                  Website
                  <ExternalLink className="size-3" />
                </a>
              </li>
            )}
            {coin.links.twitter_screen_name && (
              <li>
                <span className="label">Twitter</span>
                <a
                  href={`https://twitter.com/${coin.links.twitter_screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  <Twitter className="size-4" />
                  @{coin.links.twitter_screen_name}
                  <ExternalLink className="size-3" />
                </a>
              </li>
            )}
            {coin.links.repos_url?.github?.[0] && (
              <li>
                <span className="label">GitHub</span>
                <a
                  href={coin.links.repos_url.github[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  <Github className="size-4" />
                  GitHub
                  <ExternalLink className="size-3" />
                </a>
              </li>
            )}
            {coin.links.telegram_channel_identifier && (
              <li>
                <span className="label">Telegram</span>
                <a
                  href={`https://t.me/${coin.links.telegram_channel_identifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  <MessageCircle className="size-4" />
                  Telegram
                  <ExternalLink className="size-3" />
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CoinDetailSkeleton() {
  return (
    <div id="coin-details-page">
      <div className="primary">
        <div id="coin-overview-fallback">
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
      </div>
      <div className="secondary">
        <div className="w-full h-64 skeleton rounded-xl" />
      </div>
    </div>
  );
}

export default async function CoinDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<CoinDetailSkeleton />}>
      <CoinDetailContent id={id} />
    </Suspense>
  );
}
