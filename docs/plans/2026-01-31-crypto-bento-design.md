# Crypto Bento — Design Document

A bento.me clone purpose-built for crypto projects. One link to share all important resources.

## Target User

Crypto projects that want to share important links/resources with anyone using a single link.

## New Crypto Widgets

Three new block types alongside the existing six (socialLink, text, title, image, map, links):

### Token Price Widget (`tokenPrice`)
- User enters a CoinGecko token ID or contract address
- Displays: token name, logo, current price, 24h % change (green/red), market cap
- Data fetched from CoinGecko API, falls back to DexScreener if not found
- Cached on backend with 5-min TTL to avoid rate limits
- Refreshes on page load, not real-time

### Contract Address Card (`contractAddress`)
- User enters a contract address and selects the chain (Ethereum, Solana, Base, Arbitrum, BSC, Polygon)
- Displays: chain badge/icon, truncated address, one-click copy button
- Links to the block explorer (Etherscan, Solscan, etc.) auto-detected from chain

### DEX Buy Button (`dexLink`)
- User enters the token and selects the DEX (Uniswap, Jupiter, PancakeSwap, Raydium, etc.)
- Displays: a prominent CTA button with DEX logo and "Buy on [DEX]"
- Just a styled link, no swap integration

All three are resizable (1x1 through 5x5) and support drag-and-drop reordering.

## Dark Mode

- Theme toggle (sun/moon icon) in the profile editor toolbar
- Theme preference stored in profile model (`theme: 'light' | 'dark'`)
- Project owner picks the mode — visitors see the chosen theme
- Tailwind `class` strategy with `dark:` variants
- Dark palette: `#1a1a1a` / `#2a2a2a` backgrounds, white/light gray text, existing accent colors unchanged
- No system preference detection

## Data Model Changes

### Profile Schema Additions

```
theme: String ('light' | 'dark', default 'light')

// New block types in profiles array:

// tokenPrice
{ type: 'tokenPrice', tokenId: String, contractAddress: String, chain: String }

// contractAddress
{ type: 'contractAddress', address: String, chain: String }

// dexLink
{ type: 'dexLink', dex: String, tokenAddress: String, chain: String, url: String }
```

### Backend Additions

- `GET /api/token/:tokenId` — proxies CoinGecko, falls back to DexScreener, returns cached price data
- In-memory cache with 5-min TTL (no Redis)

No new database collections.

## Frontend Components

### New Components
- `TokenPriceCard.jsx` — token info display with loading skeleton
- `ContractAddressCard.jsx` — chain icon, truncated address, copy button, explorer link
- `DexLinkCard.jsx` — styled CTA button with DEX logo

### Modified Components
- `ResizingContainer.jsx` — add cases for 3 new block types
- `AddSocialLinks.jsx` or new `AddCryptoBlock.jsx` — UI for adding new blocks
- `[...id]/index.js` — render new types, apply `dark` class from profile theme
- Profile Redux slice — add theme state and new block type actions
- `constants/index.js` — chain configs (name, icon, explorer URL) and DEX configs (name, logo, base swap URL)

### Dark Mode Changes
- `DarkModeToggle` component in profile editor toolbar
- `dark` class on root wrapper based on profile theme
- `dark:` Tailwind variants on all existing card components and layout
