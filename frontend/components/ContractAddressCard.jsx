import React, { useState } from 'react';
import ResizingContainer from './ResizingContainer';
import { chainConfigs } from '@/constant';
import { axiosWithToken } from '@/utils/axiosjwt';
import toast from 'react-hot-toast';

const ContractAddressCard = ({ item, USERNAME }) => {
  const [copied, setCopied] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const chainConfig = chainConfigs[item.chain] || {};

  const handleResize = async (w, h) => {
    try {
      await axiosWithToken.put(
        `${API_URL}/profile/resize/${USERNAME}/${item.id}/${h}/${w}`
      );
    } catch (error) {
      console.error('Resize error:', error);
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(item.address);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = chainConfig.explorerUrl
    ? `${chainConfig.explorerUrl}${item.address}`
    : null;

  return (
    <ResizingContainer
      width={item.width}
      height={item.height}
      handleResize={handleResize}
      type={item.type}
      item={item}
      USERNAME={USERNAME}
    >
      <div className="w-full h-full flex flex-col justify-center items-center p-4 gap-2 dark:bg-[#2a2a2a] dark:text-white rounded-[24px]">
        <div
          className="px-3 py-1 rounded-full text-white text-xs font-bold"
          style={{ backgroundColor: chainConfig.color || '#666' }}
        >
          {chainConfig.name || item.chain}
        </div>
        <button
          onClick={copyAddress}
          className="font-mono text-sm hover:opacity-70 transition-opacity flex items-center gap-1"
        >
          {truncateAddress(item.address)}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            View on Explorer →
          </a>
        )}
      </div>
    </ResizingContainer>
  );
};

export default ContractAddressCard;
