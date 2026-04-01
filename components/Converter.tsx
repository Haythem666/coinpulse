'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowDownUp } from 'lucide-react';
import { CoinDetail } from '@/lib/api';

const FIAT_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
];

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.89,
  BTC: 0.000016,
};

interface ConverterProps {
  coin: CoinDetail;
}

export default function Converter({ coin }: ConverterProps) {
  const [amount, setAmount] = useState('1');
  const [currency, setCurrency] = useState('USD');

  const priceUsd = coin.market_data.current_price.usd;
  const numAmount = parseFloat(amount) || 0;
  const rate = EXCHANGE_RATES[currency] ?? 1;
  const convertedValue = numAmount * priceUsd * rate;

  const currencyInfo = FIAT_CURRENCIES.find((c) => c.code === currency) ?? FIAT_CURRENCIES[0];

  const formatConverted = (val: number) => {
    if (currency === 'BTC') return `${val.toFixed(8)} BTC`;
    if (currency === 'JPY') return `¥${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    return `${currencyInfo.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div id="converter">
      <h4>Converter</h4>

      <div className="panel">
        <p className="text-sm text-purple-100">Amount</p>
        <div className="input-wrapper">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input pl-3"
            min="0"
            step="any"
          />
          <div className="coin-info pr-3">
            <Image
              src={coin.image.small}
              alt={coin.name}
              width={20}
              height={20}
              className="rounded-full"
            />
            <p>{coin.symbol.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="divider">
        <div className="line" />
        <ArrowDownUp className="icon" />
      </div>

      <div className="panel">
        <p className="text-sm text-purple-100">Converted</p>
        <div className="output-wrapper">
          <p className="pl-3">{formatConverted(convertedValue)}</p>
          <div className="pr-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="select-trigger bg-dark-400 border-none text-purple-100 text-sm font-semibold cursor-pointer rounded-md px-2 py-1 outline-none"
            >
              {FIAT_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-dark-400">
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
