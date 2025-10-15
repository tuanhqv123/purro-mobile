export interface MarketTokenItem {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  change24h: number | null; // percent
  logo?: string | null;
}

export interface RawTokenData {
  id?: string;
  attributes?: {
    address?: string;
    symbol?: string;
    name?: string;
    price_usd?: number;
    token?: {
      symbol?: string;
      name?: string;
      logo?: string;
      logo_url?: string;
    };
    base_token?: {
      symbol?: string;
      name?: string;
      logo?: string;
      logo_url?: string;
    };
    token0?: {
      symbol?: string;
      name?: string;
      logo?: string;
      logo_url?: string;
    };
  };
}

export interface CoinGeckoToken {
  id?: string | number;
  symbol?: string;
  name?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  image?: string;
}
