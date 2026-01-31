import React, { useEffect, useState } from 'react';
import ResizingContainer from './ResizingContainer';
import { axiosWithToken } from '@/utils/axiosjwt';

const TokenPriceCard = ({ item, USERNAME }) => {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleResize = async (w, h) => {
    try {
      await axiosWithToken.put(
        `${API_URL}/profile/resize/${USERNAME}/${item.id}/${h}/${w}`
      );
    } catch (error) {
      console.error('Resize error:', error);
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const params = {};
        if (item.contractAddress) params.contractAddress = item.contractAddress;
        if (item.chain) params.chain = item.chain;

        const res = await axiosWithToken.get(
          `${API_URL}/api/token/${item.tokenId}`,
          { params }
        );
        setTokenData(res.data);
      } catch (error) {
        console.error('Token fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (item.tokenId) {
      fetchToken();
    }
  }, [item.tokenId, item.contractAddress, item.chain]);

  const isPositive = tokenData?.change24h >= 0;

  return (
    <ResizingContainer
      width={item.width}
      height={item.height}
      handleResize={handleResize}
      type={item.type}
      item={item}
      USERNAME={USERNAME}
    >
      <div className="w-full h-full flex flex-col justify-center items-center p-4 dark:bg-[#2a2a2a] dark:text-white rounded-[24px]">
        {loading ? (
          <div className="animate-pulse flex flex-col items-center gap-2 w-full">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : tokenData ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              {tokenData.image && (
                <img
                  src={tokenData.image}
                  alt={tokenData.name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="font-bold text-sm">{tokenData.symbol}</span>
            </div>
            <div className="text-lg font-bold">
              ${tokenData.price < 0.01
                ? tokenData.price.toFixed(6)
                : tokenData.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </div>
            <div
              className={`text-xs font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? '+' : ''}
              {tokenData.change24h?.toFixed(2)}%
            </div>
            {item.width >= 3 && tokenData.marketCap > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                MCap: ${(tokenData.marketCap / 1e6).toFixed(1)}M
              </div>
            )}
          </>
        ) : (
          <span className="text-sm text-gray-400">Token not found</span>
        )}
      </div>
    </ResizingContainer>
  );
};

export default TokenPriceCard;
