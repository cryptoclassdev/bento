import React from 'react';
import ResizingContainer from './ResizingContainer';
import { dexConfigs } from '@/constant';
import { axiosWithToken } from '@/utils/axiosjwt';

const DexLinkCard = ({ item, USERNAME }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const dexConfig = dexConfigs[item.dex] || {};

  const handleResize = async (w, h) => {
    try {
      await axiosWithToken.put(
        `${API_URL}/profile/resize/${USERNAME}/${item.id}/${h}/${w}`
      );
    } catch (error) {
      console.error('Resize error:', error);
    }
  };

  const swapUrl = item.url || (dexConfig.getSwapUrl && item.tokenAddress
    ? dexConfig.getSwapUrl(item.tokenAddress)
    : '#');

  return (
    <ResizingContainer
      width={item.width}
      height={item.height}
      handleResize={handleResize}
      type={item.type}
      item={item}
      USERNAME={USERNAME}
    >
      <div className="w-full h-full flex items-center justify-center p-4 dark:bg-[#2a2a2a] rounded-[24px]">
        <a
          href={swapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: dexConfig.color || '#333' }}
        >
          Buy on {dexConfig.name || item.dex}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      </div>
    </ResizingContainer>
  );
};

export default DexLinkCard;
