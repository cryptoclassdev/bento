const axios = require('axios');

const cache = {};
const CACHE_TTL = 5 * 60 * 1000;

const getTokenPrice = async (req, res) => {
  const { tokenId } = req.params;
  const { chain, contractAddress } = req.query;

  const cacheKey = `${tokenId}-${chain || ''}-${contractAddress || ''}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  try {
    const cgRes = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${tokenId}`,
      {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
        },
      }
    );

    const coin = cgRes.data;
    const result = {
      source: 'coingecko',
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      image: coin.image?.small || '',
      price: coin.market_data?.current_price?.usd || 0,
      change24h: coin.market_data?.price_change_percentage_24h || 0,
      marketCap: coin.market_data?.market_cap?.usd || 0,
    };

    cache[cacheKey] = { data: result, timestamp: Date.now() };
    return res.status(200).json(result);
  } catch (cgError) {
    if (contractAddress && chain) {
      try {
        const dsRes = await axios.get(
          `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
        );

        const pairs = dsRes.data?.pairs;
        if (pairs && pairs.length > 0) {
          const pair = pairs[0];
          const result = {
            source: 'dexscreener',
            name: pair.baseToken?.name || tokenId,
            symbol: pair.baseToken?.symbol || '',
            image: '',
            price: parseFloat(pair.priceUsd) || 0,
            change24h: pair.priceChange?.h24 || 0,
            marketCap: pair.marketCap || 0,
          };

          cache[cacheKey] = { data: result, timestamp: Date.now() };
          return res.status(200).json(result);
        }
      } catch (dsError) {
        console.error('DexScreener fallback error:', dsError.message);
      }
    }

    console.error('Token price fetch error:', cgError.message);
    return res.status(404).json({ message: 'Token not found' });
  }
};

module.exports = { getTokenPrice };
