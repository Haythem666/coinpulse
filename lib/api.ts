const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  ath: number;
  atl: number;
  sparkline_in_7d?: { price: number[] };
}

export interface TrendingCoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data: {
    price: number;
    price_btc: string;
    price_change_percentage_24h: { usd: number };
    market_cap: string;
    total_volume: string;
    sparkline: string;
  };
}

export interface CoinCategory {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  top_3_coins: string[];
  volume_24h: number;
  updated_at: string;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { thumb: string; small: string; large: string };
  market_cap_rank: number;
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number };
    atl: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
  };
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    repos_url: { github: string[] };
  };
  tickers: Array<{
    market: { name: string; identifier: string; logo: string };
    base: string;
    target: string;
    last: number;
    volume: number;
    trade_url: string;
    timestamp: string;
  }>;
  categories: string[];
}

export interface MarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

async function fetchCoinGecko<T>(endpoint: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${COINGECKO_BASE}${endpoint}`, {
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getTopCoins(page = 1, perPage = 50): Promise<CoinMarket[]> {
  return fetchCoinGecko<CoinMarket[]>(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`
  );
}

export async function getTrendingCoins(): Promise<{ coins: { item: TrendingCoinItem }[] }> {
  return fetchCoinGecko('/search/trending', 300);
}

export async function getCategories(perPage = 10): Promise<CoinCategory[]> {
  return fetchCoinGecko<CoinCategory[]>(
    `/coins/categories?order=market_cap_desc&per_page=${perPage}`
  );
}

export async function getCoinDetail(id: string): Promise<CoinDetail> {
  return fetchCoinGecko<CoinDetail>(
    `/coins/${id}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`,
    120
  );
}

export async function getCoinMarketChart(id: string, days = 30): Promise<MarketChart> {
  return fetchCoinGecko<MarketChart>(
    `/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
    120
  );
}

export async function searchCoins(query: string): Promise<{ coins: SearchCoin[] }> {
  return fetchCoinGecko<{ coins: SearchCoin[] }>(
    `/search?query=${encodeURIComponent(query)}`,
    0
  );
}

export async function getTopGainersLosers(): Promise<{
  gainers: CoinMarket[];
  losers: CoinMarket[];
}> {
  const coins = await fetchCoinGecko<CoinMarket[]>(
    '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'
  );
  const filtered = coins.filter(
    (c) => c.price_change_percentage_24h !== null && !isNaN(c.price_change_percentage_24h)
  );
  const sorted = [...filtered].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  );
  return {
    gainers: sorted.slice(0, 5),
    losers: sorted.slice(-5).reverse(),
  };
}
