'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { SearchCoin } from '@/lib/api';
import { formatPrice, formatChange } from '@/lib/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SearchResult extends SearchCoin {
  current_price?: number;
  price_change_percentage_24h?: number;
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? handleClose() : handleOpen();
      }
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      setResults((data.coins ?? []).slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleSelect = (id: string) => {
    router.push(`/coins/${id}`);
    handleClose();
  };

  return (
    <div id="search-modal">
      <button className="trigger" onClick={handleOpen} aria-label="Search coins">
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="kbd">
          <span>⌘</span>K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <div className="dialog relative w-full z-10 rounded-xl shadow-2xl overflow-hidden">
            <div className="cmd-input flex items-center px-4 py-3 border-b border-dark-400/50">
              <Search className="size-4 text-purple-100 mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coins..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-purple-100"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-purple-100 hover:text-white">
                  <X className="size-4" />
                </button>
              )}
              <button onClick={handleClose} className="ml-3 text-purple-100 hover:text-white sm:hidden">
                <X className="size-4" />
              </button>
            </div>

            <div className="list overflow-y-auto custom-scrollbar">
              {loading && (
                <div className="py-8 text-center text-purple-100 text-sm">Searching...</div>
              )}
              {!loading && query && results.length === 0 && (
                <div className="empty">No coins found for &quot;{query}&quot;</div>
              )}
              {!loading && !query && (
                <div className="empty">Type to search for coins...</div>
              )}
              {!loading && results.length > 0 && (
                <div className="group">
                  <div className="heading px-4 py-2 text-xs font-medium uppercase tracking-wider">
                    <Search className="size-3" />
                    Results
                  </div>
                  {results.map((coin) => {
                    const isUp = (coin.price_change_percentage_24h ?? 0) >= 0;
                    return (
                      <button
                        key={coin.id}
                        className="search-item w-full text-left px-4"
                        onClick={() => handleSelect(coin.id)}
                      >
                        <div className="coin-info">
                          {coin.thumb && (
                            <Image src={coin.thumb} alt={coin.name} width={36} height={36} />
                          )}
                          <div>
                            <span className="text-sm font-medium">{coin.name}</span>
                            <span className="coin-symbol">{coin.symbol}</span>
                          </div>
                        </div>
                        <span className="text-purple-100 text-sm">
                          #{coin.market_cap_rank ?? '—'}
                        </span>
                        {coin.current_price != null && (
                          <span className="coin-price">{formatPrice(coin.current_price)}</span>
                        )}
                        {coin.price_change_percentage_24h != null && (
                          <span className={`coin-change ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                            {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                            {formatChange(coin.price_change_percentage_24h)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
