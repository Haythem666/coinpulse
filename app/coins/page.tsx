import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTopCoins } from '@/lib/api';
import { formatPrice, formatLargeNumber, formatChange } from '@/lib/formatters';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const revalidate = 60;

const PER_PAGE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

async function CoinsContent({ page }: { page: number }) {
  const coins = await getTopCoins(page, PER_PAGE);

  return (
    <div id="coins-page">
      <div className="content">
        <h4>All Cryptocurrencies</h4>

        <div className="coins-table custom-scrollbar">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-dark-400/50 text-purple-100 text-sm">
                  <th className="rank-cell py-4 text-left">Rank</th>
                  <th className="token-cell py-4 text-left pl-3">Name</th>
                  <th className="price-cell py-4 text-right pr-5">Price</th>
                  <th className="change-cell py-4 text-right pr-5">24h %</th>
                  <th className="market-cap-cell py-4 text-right pr-5">Market Cap</th>
                  <th className="market-cap-cell py-4 text-right pr-5 hidden md:table-cell">Volume 24h</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin) => {
                  const isUp = coin.price_change_percentage_24h >= 0;
                  return (
                    <tr
                      key={coin.id}
                      className="border-b border-dark-400/40 last:border-none hover:bg-dark-400/20 transition-all relative"
                    >
                      <td className="rank-cell relative">
                        <Link href={`/coins/${coin.id}`} className="absolute inset-0 z-10" />
                        {coin.market_cap_rank}
                      </td>
                      <td className="token-cell">
                        <div className="token-info pl-3">
                          <Image src={coin.image} alt={coin.name} width={32} height={32} className="rounded-full flex-shrink-0" />
                          <div>
                            <p className="font-semibold">{coin.name}</p>
                            <p className="text-xs text-purple-100 uppercase">{coin.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="price-cell text-right pr-5">
                        {formatPrice(coin.current_price)}
                      </td>
                      <td className="change-cell text-right pr-5">
                        <span className={`change-value ${isUp ? 'text-green-500' : 'text-red-500'} justify-end`}>
                          {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="market-cap-cell text-right pr-5">
                        {formatLargeNumber(coin.market_cap)}
                      </td>
                      <td className="market-cap-cell text-right pr-5 hidden md:table-cell">
                        {formatLargeNumber(coin.total_volume)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div id="coins-pagination">
          <div className="pagination-content justify-between items-center">
            <div className="pagination-control prev">
              {page > 1 ? (
                <Link href={`/coins?page=${page - 1}`} className="control-button flex items-center gap-1 px-3 py-2 text-sm">
                  <ChevronLeft className="size-4" />
                  Previous
                </Link>
              ) : (
                <span className="control-disabled flex items-center gap-1 px-3 py-2 text-sm text-purple-100">
                  <ChevronLeft className="size-4" />
                  Previous
                </span>
              )}
            </div>

            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, 10) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i;
                if (pageNum > 10) return null;
                return (
                  <Link
                    key={pageNum}
                    href={`/coins?page=${pageNum}`}
                    className={`page-link px-3 py-2 text-sm ${pageNum === page ? 'page-link-active' : ''}`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            <div className="pagination-control next">
              {page < 10 ? (
                <Link href={`/coins?page=${page + 1}`} className="control-button flex items-center gap-1 px-3 py-2 text-sm">
                  Next
                  <ChevronRight className="size-4" />
                </Link>
              ) : (
                <span className="control-disabled flex items-center gap-1 px-3 py-2 text-sm text-purple-100">
                  Next
                  <ChevronRight className="size-4" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoinsSkeleton() {
  return (
    <div id="coins-page">
      <div className="content">
        <h4>All Cryptocurrencies</h4>
        <div className="coins-table">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-dark-400/40">
              <div className="h-4 w-8 skeleton rounded" />
              <div className="h-8 w-8 skeleton rounded-full" />
              <div className="h-4 w-28 skeleton rounded" />
              <div className="flex-1" />
              <div className="h-4 w-20 skeleton rounded" />
              <div className="h-4 w-16 skeleton rounded" />
              <div className="h-4 w-24 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function CoinsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  return (
    <Suspense fallback={<CoinsSkeleton />}>
      <CoinsContent page={page} />
    </Suspense>
  );
}
