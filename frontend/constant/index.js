export const defaultSocialLinks = {
  twitter: {
    type: 'socialLink',
    baseUrl: 'twitter',
    userName: '',
    logo: 'https://res.cloudinary.com/dqlj6jlir/image/upload/v1715698990/logo/twitter_leayqs.svg',
    bgColor: '#55ACEE',
  },
  instagram: {
    type: 'socialLink',
    baseUrl: 'instagram',
    userName: '',
    logo: 'https://res.cloudinary.com/dqlj6jlir/image/upload/v1715698960/logo/instagram_psrjkv.svg',
    bgColor: '#CE3B9F',
  },
  github: {
    type: 'socialLink',
    baseUrl: 'github',
    userName: '',
    logo: 'https://res.cloudinary.com/dqlj6jlir/image/upload/v1715698955/logo/github_bpmxzd.svg',
    bgColor: '#181717',
  },
  linkedin: {
    type: 'socialLink',
    baseUrl: 'linkedin',
    userName: '',
    logo: 'https://res.cloudinary.com/dqlj6jlir/image/upload/v1715698975/logo/linkedin_dmyqon.svg',
    bgColor: '#007EBB',
  },
  dribbble: {
    type: 'socialLink',
    baseUrl: 'dribbble',
    userName: '',
    logo: 'https://res.cloudinary.com/dqlj6jlir/image/upload/v1715699056/logo/dribble_wx1hht.svg',
    bgColor: '#D15584',
  },
  buymeacoffee: {
    type: 'socialLink',
    baseUrl: 'buymeacoffee',
    userName: '',
    logo: 'https://res.cloudinary.com/dqlj6jlir/image/upload/v1715699053/logo/coffee_eerped.svg',
    bgColor: '#FFDD06',
  },
};

export const chainConfigs = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io/address/',
    color: '#627EEA',
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    explorerUrl: 'https://solscan.io/account/',
    color: '#9945FF',
  },
  base: {
    name: 'Base',
    symbol: 'BASE',
    explorerUrl: 'https://basescan.org/address/',
    color: '#0052FF',
  },
  arbitrum: {
    name: 'Arbitrum',
    symbol: 'ARB',
    explorerUrl: 'https://arbiscan.io/address/',
    color: '#28A0F0',
  },
  bsc: {
    name: 'BNB Chain',
    symbol: 'BNB',
    explorerUrl: 'https://bscscan.com/address/',
    color: '#F0B90B',
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com/address/',
    color: '#8247E5',
  },
};

export const dexConfigs = {
  uniswap: {
    name: 'Uniswap',
    color: '#FF007A',
    getSwapUrl: (tokenAddress) =>
      `https://app.uniswap.org/swap?outputCurrency=${tokenAddress}`,
  },
  jupiter: {
    name: 'Jupiter',
    color: '#00D18C',
    getSwapUrl: (tokenAddress) =>
      `https://jup.ag/swap/SOL-${tokenAddress}`,
  },
  pancakeswap: {
    name: 'PancakeSwap',
    color: '#D1884F',
    getSwapUrl: (tokenAddress) =>
      `https://pancakeswap.finance/swap?outputCurrency=${tokenAddress}`,
  },
  raydium: {
    name: 'Raydium',
    color: '#5AC4BE',
    getSwapUrl: (tokenAddress) =>
      `https://raydium.io/swap/?outputMint=${tokenAddress}`,
  },
};
