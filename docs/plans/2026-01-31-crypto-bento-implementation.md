# Crypto Bento Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three crypto-specific widgets (token price, contract address, DEX buy button) and dark mode to the existing bento.me clone.

**Architecture:** Extend the existing profile schema with new block types and a theme field. Add a backend token price proxy route with in-memory caching. Frontend gets three new card components, dark mode via Tailwind `class` strategy, and updated constants for chain/DEX configs.

**Tech Stack:** Next.js, Express, MongoDB/Mongoose, Tailwind CSS, Redux Toolkit, CoinGecko API, DexScreener API

---

### Task 1: Add chain and DEX constants

**Files:**
- Modify: `frontend/constant/index.js`

**Step 1: Add chain and DEX config objects to constants file**

Add the following after the existing `defaultSocialLinks` export in `frontend/constant/index.js`:

```javascript
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
    getSwapUrl: (tokenAddress) => `https://app.uniswap.org/swap?outputCurrency=${tokenAddress}`,
  },
  jupiter: {
    name: 'Jupiter',
    color: '#00D18C',
    getSwapUrl: (tokenAddress) => `https://jup.ag/swap/SOL-${tokenAddress}`,
  },
  pancakeswap: {
    name: 'PancakeSwap',
    color: '#D1884F',
    getSwapUrl: (tokenAddress) => `https://pancakeswap.finance/swap?outputCurrency=${tokenAddress}`,
  },
  raydium: {
    name: 'Raydium',
    color: '#5AC4BE',
    getSwapUrl: (tokenAddress) => `https://raydium.io/swap/?outputMint=${tokenAddress}`,
  },
};
```

**Step 2: Commit**

```bash
git add frontend/constant/index.js
git commit -m "feat: add chain and DEX config constants for crypto widgets"
```

---

### Task 2: Update backend profile schema

**Files:**
- Modify: `backend/src/models/porfile.model.js`

**Step 1: Add theme field and new block type enum values**

In `backend/src/models/porfile.model.js`:

1. Add `theme` field after the `bio` field (line 20):

```javascript
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },
```

2. Update the `type` enum in the profiles array (line 27) from:
```javascript
enum: ['socialLink', 'text', 'map', 'image', 'title', 'links'],
```
to:
```javascript
enum: ['socialLink', 'text', 'map', 'image', 'title', 'links', 'tokenPrice', 'contractAddress', 'dexLink'],
```

3. Add new fields for crypto block types after the `width` field (after line 116):

```javascript
      // Token price widget fields
      tokenId: {
        type: String,
      },
      contractAddress: {
        type: String,
      },
      chain: {
        type: String,
      },
      // Contract address card fields
      address: {
        type: String,
      },
      // DEX link fields
      dex: {
        type: String,
      },
      tokenAddress: {
        type: String,
      },
      url: {
        type: String,
      },
```

**Step 2: Commit**

```bash
git add backend/src/models/porfile.model.js
git commit -m "feat: add theme field and crypto block types to profile schema"
```

---

### Task 3: Update backend controller to handle new block types and theme

**Files:**
- Modify: `backend/src/routes/profile.controller.js`
- Modify: `backend/src/routes/profile.router.js`

**Step 1: Update addProfileObject to destructure new fields**

In `profile.controller.js`, update the destructuring in `addProfileObject` (around line 31-45) to include new fields:

```javascript
  const {
    type, id, baseUrl, userName, logo, bgColor, content, location,
    imgUrl, width, height, hostname, link,
    // Crypto fields
    tokenId, contractAddress, chain, address, dex, tokenAddress, url,
  } = req.body;
```

Update `newProfileObject` (around line 73-87) to include:

```javascript
    const newProfileObject = {
      type, id, baseUrl, userName, logo, bgColor, content, location,
      imgUrl, width, height, hostname, link,
      tokenId, contractAddress, chain, address, dex, tokenAddress, url,
    };
```

**Step 2: Do the same for updateProfileObject**

Update the destructuring (around line 210-224) and the `newProfileObject` (around line 266-280) similarly.

**Step 3: Add updateTheme controller function**

Add after `updateBio` function (after line 524):

```javascript
const updateTheme = async (req, res) => {
  let { username } = req.params;
  username = String(username);
  const { theme } = req.body;

  if (!['light', 'dark'].includes(theme)) {
    return res.status(400).json({ message: 'Invalid theme value' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    await verifyUsernameMatch(token, username);

    const user = await User.findOne({ username }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await Profile.findOne({ user: user._id }).session(session);

    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Profile not found for the user' });
    }

    profile.theme = theme;
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Theme updated successfully', theme });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update theme error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

Update the `module.exports` to include `updateTheme`.

**Step 4: Add theme route**

In `profile.router.js`, add before the `module.exports`:

```javascript
router.put('/theme/:username', profileController.updateTheme);
```

Place it after line 12 (after `router.put('/bio/:username', ...)`).

**Step 5: Commit**

```bash
git add backend/src/routes/profile.controller.js backend/src/routes/profile.router.js
git commit -m "feat: add crypto fields to profile controller and theme update endpoint"
```

---

### Task 4: Add token price proxy API route

**Files:**
- Create: `backend/src/routes/token.router.js`
- Create: `backend/src/routes/token.controller.js`
- Modify: `backend/src/app.js`

**Step 1: Create token controller with CoinGecko + DexScreener fallback**

Create `backend/src/routes/token.controller.js`:

```javascript
const axios = require('axios');

// In-memory cache: { [tokenId]: { data, timestamp } }
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getTokenPrice = async (req, res) => {
  const { tokenId } = req.params;
  const { chain, contractAddress } = req.query;

  // Check cache
  const cacheKey = `${tokenId}-${chain || ''}-${contractAddress || ''}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  try {
    // Try CoinGecko first
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
    // CoinGecko failed, try DexScreener if we have contract info
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
```

**Step 2: Create token router**

Create `backend/src/routes/token.router.js`:

```javascript
const express = require('express');
const router = express.Router();
const tokenController = require('./token.controller');

router.get('/:tokenId', tokenController.getTokenPrice);

module.exports = router;
```

**Step 3: Mount token router in app.js**

In `backend/src/app.js`, add after line 8:

```javascript
const tokenRouter = require('./routes/token.router.js');
```

Add after line 91 (`app.use('/profile', profileRouter);`):

```javascript
app.use('/api/token', tokenRouter);
```

**Step 4: Commit**

```bash
git add backend/src/routes/token.controller.js backend/src/routes/token.router.js backend/src/app.js
git commit -m "feat: add token price proxy API with CoinGecko + DexScreener fallback"
```

---

### Task 5: Enable Tailwind dark mode

**Files:**
- Modify: `frontend/tailwind.config.js`

**Step 1: Add darkMode class strategy**

In `frontend/tailwind.config.js`, add `darkMode: 'class',` before the `content` key (after line 2):

```javascript
module.exports = {
  darkMode: 'class',
  content: [
```

**Step 2: Commit**

```bash
git add frontend/tailwind.config.js
git commit -m "feat: enable Tailwind dark mode with class strategy"
```

---

### Task 6: Update Redux profile slice for theme

**Files:**
- Modify: `frontend/store/profile-slice.js`

**Step 1: Add theme to initial state and add reducer**

Add `theme: 'light',` to the `initialState` object (after line 64, after `avatar: ''`).

Add a new reducer in the `reducers` object:

```javascript
    updateTheme(state, action) {
      state.theme = action.payload;
    },
```

**Step 2: Commit**

```bash
git add frontend/store/profile-slice.js
git commit -m "feat: add theme state and reducer to profile slice"
```

---

### Task 7: Create TokenPriceCard component

**Files:**
- Create: `frontend/components/TokenPriceCard.jsx`

**Step 1: Create the component**

Create `frontend/components/TokenPriceCard.jsx`:

```jsx
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
```

**Step 2: Commit**

```bash
git add frontend/components/TokenPriceCard.jsx
git commit -m "feat: add TokenPriceCard component with live price display"
```

---

### Task 8: Create ContractAddressCard component

**Files:**
- Create: `frontend/components/ContractAddressCard.jsx`

**Step 1: Create the component**

Create `frontend/components/ContractAddressCard.jsx`:

```jsx
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
```

**Step 2: Commit**

```bash
git add frontend/components/ContractAddressCard.jsx
git commit -m "feat: add ContractAddressCard component with copy and explorer link"
```

---

### Task 9: Create DexLinkCard component

**Files:**
- Create: `frontend/components/DexLinkCard.jsx`

**Step 1: Create the component**

Create `frontend/components/DexLinkCard.jsx`:

```jsx
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
```

**Step 2: Commit**

```bash
git add frontend/components/DexLinkCard.jsx
git commit -m "feat: add DexLinkCard component with styled buy button"
```

---

### Task 10: Wire new card components into the profile page

**Files:**
- Modify: `frontend/pages/[...id]/index.js`

**Step 1: Add imports for new components**

Add after the existing component imports (around line 27):

```javascript
import TokenPriceCard from '@/components/TokenPriceCard';
import ContractAddressCard from '@/components/ContractAddressCard';
import DexLinkCard from '@/components/DexLinkCard';
```

**Step 2: Add rendering cases in the DragDropContext section**

In the `profileDetails.map` inside the Draggable (around line 566-599), add after the `title` case:

```jsx
                                {item.type === 'tokenPrice' && (
                                  <TokenPriceCard
                                    item={item}
                                    USERNAME={USERNAME}
                                  />
                                )}
                                {item.type === 'contractAddress' && (
                                  <ContractAddressCard
                                    item={item}
                                    USERNAME={USERNAME}
                                  />
                                )}
                                {item.type === 'dexLink' && (
                                  <DexLinkCard
                                    item={item}
                                    USERNAME={USERNAME}
                                  />
                                )}
```

**Step 3: Add the same rendering cases in the non-editable (visitor) section**

In the non-draggable map (around line 618-636), add the same three blocks after the `title` case.

**Step 4: Load theme from profile data**

In the `getData` function (around line 94-114), after dispatching `updateBio`, add:

```javascript
        dispatch(profileActions.updateTheme(profile.theme || 'light'));
```

**Step 5: Commit**

```bash
git add frontend/pages/[...id]/index.js
git commit -m "feat: render crypto widget cards and load theme from profile"
```

---

### Task 11: Add dark mode wrapper and theme toggle

**Files:**
- Modify: `frontend/pages/[...id]/index.js`

**Step 1: Get theme from Redux and apply dark class**

Add `theme` to the useSelector destructuring (around line 79):

```javascript
  const { profileDetails, avatar, name, bio, theme } = useSelector(
    (state) => state.profile
  );
```

**Step 2: Wrap the main element with dark class**

Change the `<main>` tag (around line 458) to include the dark class conditionally:

```jsx
      <main
        className={`${inter.className} ${theme === 'dark' ? 'dark' : ''} overflow-x-hidden flex justify-center ${
          isLaptop && 'xl:justify-normal'
        }`}>
```

**Step 3: Add dark mode background to the main wrapper**

Add `dark:bg-[#1a1a1a]` to the `<main>` className and `min-h-screen` so the dark background fills the page.

**Step 4: Add theme toggle function**

Add after the `handleLogout` function:

```javascript
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    dispatch(profileActions.updateTheme(newTheme));
    try {
      await axiosWithToken.put(`${API_URL}/profile/theme/${USERNAME}`, {
        theme: newTheme,
      });
    } catch (error) {
      console.error('Theme update error:', error);
    }
  };
```

**Step 5: Add theme toggle button to the fixed bottom bar**

In the fixed bottom bar (around line 646), add a theme toggle button. Place it before the logout button (before line 766):

```jsx
            <div className="mx-4 w-[2px] h-[16px] bg-gray-300 hidden xl:block"></div>
            <div className="px-[10px] rounded h-[33px] flex items-center justify-center">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center rounded-md w-6 h-6"
              >
                {theme === 'dark' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>
```

**Step 6: Commit**

```bash
git add frontend/pages/[...id]/index.js
git commit -m "feat: add dark mode toggle and apply theme to profile page"
```

---

### Task 12: Add dark mode styles to existing components

**Files:**
- Modify: `frontend/components/ResizingContainer.jsx`
- Modify: `frontend/components/TextBox.jsx`
- Modify: `frontend/components/SocialLinkCard.jsx`
- Modify: `frontend/components/ImageCard.jsx`
- Modify: `frontend/components/OtherLinkCard.jsx`
- Modify: `frontend/components/TitleBox.jsx`
- Modify: `frontend/components/NameBio.jsx`

**Step 1: Update ResizingContainer**

In `ResizingContainer.jsx`, change the `bg-white` class on the card container (line 96) to:

```
bg-white dark:bg-[#2a2a2a] dark:border-gray-700
```

Change the delete button `bg-white` (line 104) to:

```
bg-white dark:bg-[#2a2a2a]
```

**Step 2: Update text-related components**

For each component that displays text (`TextBox.jsx`, `TitleBox.jsx`, `NameBio.jsx`), add `dark:text-white` to the text color classes.

**Step 3: Update the bottom toolbar**

In `[...id]/index.js`, update the fixed bar (line 646) from:

```
bg-white/50
```
to:
```
bg-white/50 dark:bg-[#1a1a1a]/80
```

**Step 4: Commit**

```bash
git add frontend/components/ResizingContainer.jsx frontend/components/TextBox.jsx frontend/components/SocialLinkCard.jsx frontend/components/ImageCard.jsx frontend/components/OtherLinkCard.jsx frontend/components/TitleBox.jsx frontend/components/NameBio.jsx frontend/pages/[...id]/index.js
git commit -m "feat: add dark mode styles to all existing components"
```

---

### Task 13: Add crypto block creation UI to the bottom toolbar

**Files:**
- Modify: `frontend/pages/[...id]/index.js`

**Step 1: Import chain and DEX configs**

Add to imports:

```javascript
import { defaultSocialLinks, chainConfigs, dexConfigs } from '@/constant';
```

**Step 2: Add state for crypto block popover**

Add after the existing state declarations:

```javascript
  const [isCryptoMenuOpen, setIsCryptoMenuOpen] = useState(false);
```

**Step 3: Add functions to create each crypto block**

Add after the `addTitle` function:

```javascript
  const addTokenPrice = async (tokenId, contractAddr, chain) => {
    const res = await axiosWithToken.post(`${API_URL}/profile/${USERNAME}`, {
      id: uuidv4(),
      type: 'tokenPrice',
      tokenId,
      contractAddress: contractAddr || '',
      chain: chain || '',
      width: 1,
      height: 1,
    });
    dispatch(
      profileActions.setProfileDetails([
        ...profileDetails,
        res.data.addedObject,
      ])
    );
  };

  const addContractAddress = async (address, chain) => {
    const res = await axiosWithToken.post(`${API_URL}/profile/${USERNAME}`, {
      id: uuidv4(),
      type: 'contractAddress',
      address,
      chain,
      width: 2,
      height: 2,
    });
    dispatch(
      profileActions.setProfileDetails([
        ...profileDetails,
        res.data.addedObject,
      ])
    );
  };

  const addDexLink = async (dex, tokenAddress, chain) => {
    const dexConfig = dexConfigs[dex];
    const url = dexConfig ? dexConfig.getSwapUrl(tokenAddress) : '';
    const res = await axiosWithToken.post(`${API_URL}/profile/${USERNAME}`, {
      id: uuidv4(),
      type: 'dexLink',
      dex,
      tokenAddress,
      chain,
      url,
      width: 2,
      height: 2,
    });
    dispatch(
      profileActions.setProfileDetails([
        ...profileDetails,
        res.data.addedObject,
      ])
    );
  };
```

**Step 4: Add a crypto menu button to the bottom toolbar**

Add a new button in the toolbar (after the title button, around line 745). This button opens a dropdown with three options:

```jsx
              <div className="w-[32px] h-[32px] flex items-center justify-center cursor-pointer relative">
                <div
                  onClick={() => setIsCryptoMenuOpen(!isCryptoMenuOpen)}
                  className="w-[24px] h-[24px] rounded-md flex items-center justify-center border hover:shadow-xl text-xs font-bold"
                >
                  ₿
                </div>
                {isCryptoMenuOpen && (
                  <div className="absolute bottom-[3rem] left-[-4rem] w-[14rem] bg-white dark:bg-[#2a2a2a] border dark:border-gray-700 shadow-lg rounded-lg p-2 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        const tokenId = prompt('Enter CoinGecko token ID (e.g., bitcoin, ethereum):');
                        if (tokenId) {
                          const contractAddr = prompt('Contract address (optional, for DexScreener fallback):') || '';
                          const chain = prompt('Chain (optional, e.g., ethereum, solana):') || '';
                          addTokenPrice(tokenId, contractAddr, chain);
                        }
                        setIsCryptoMenuOpen(false);
                      }}
                      className="text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    >
                      Token Price
                    </button>
                    <button
                      onClick={() => {
                        const address = prompt('Enter contract address:');
                        if (address) {
                          const chain = prompt('Select chain (ethereum, solana, base, arbitrum, bsc, polygon):') || 'ethereum';
                          addContractAddress(address, chain);
                        }
                        setIsCryptoMenuOpen(false);
                      }}
                      className="text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    >
                      Contract Address
                    </button>
                    <button
                      onClick={() => {
                        const dex = prompt('Select DEX (uniswap, jupiter, pancakeswap, raydium):') || 'uniswap';
                        const tokenAddress = prompt('Enter token address:');
                        if (tokenAddress) {
                          const chain = prompt('Chain (ethereum, solana, bsc):') || 'ethereum';
                          addDexLink(dex, tokenAddress, chain);
                        }
                        setIsCryptoMenuOpen(false);
                      }}
                      className="text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    >
                      DEX Buy Button
                    </button>
                  </div>
                )}
              </div>
```

**Note:** Using `prompt()` is intentionally simple for the initial implementation. A proper modal can replace this later.

**Step 5: Commit**

```bash
git add frontend/pages/[...id]/index.js
git commit -m "feat: add crypto block creation menu to editor toolbar"
```

---

### Task 14: Verify the full implementation

**Step 1: Start backend**

```bash
cd backend && npm install && npm start
```

Expected: Server starts without errors, connects to MongoDB.

**Step 2: Start frontend**

```bash
cd frontend && npm install && npm run dev
```

Expected: Next.js dev server starts without errors.

**Step 3: Manual test checklist**

- [ ] Login and navigate to profile
- [ ] Click ₿ button in toolbar → see three crypto options
- [ ] Add a token price widget with tokenId "bitcoin" → see live price
- [ ] Add a contract address card → see truncated address with copy button
- [ ] Add a DEX buy button → see styled CTA linking to DEX
- [ ] Toggle dark mode → page switches to dark theme
- [ ] Refresh page → dark mode persists (loaded from backend)
- [ ] All existing widgets still work (text, image, map, social, links, title)
- [ ] Drag and drop reordering works with new widgets
- [ ] Resizing works on new widgets

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: crypto bento - token price, contract address, DEX buy button, dark mode"
```
