# CLAUDE.md — Bento Clone

## Project Overview

Bento Clone is a full-stack **link-in-bio / customizable profile** platform tailored for **early-stage crypto products**. Projects create accounts, build a profile page with draggable widgets (social links, text notes, images, titles, external links, crypto widgets), and share a public URL. The app supports light/dark themes, avatar uploads, and drag-and-drop widget reordering.

**Live:** https://bento-clone-app.vercel.app

### Tech Stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 14, React 18, Redux Toolkit, Tailwind CSS 3, SCSS    |
| Backend  | Node.js 16, Express.js, Mongoose/MongoDB                     |
| Auth     | Passport (Google OAuth + Local), JWT (stored in cookies)      |
| Storage  | Cloudinary (images/avatars)                                   |
| Crypto   | CoinGecko API (DexScreener fallback) for token prices         |
| Deploy   | Vercel (frontend), Render (backend)                           |

---

## Build / Run / Lint Commands

### Backend

```bash
cd backend
npm install
npm start          # starts Express via nodemon on PORT (default 8000)
```

No test suite configured — `npm test` is a placeholder.

### Frontend

```bash
cd frontend
npm install
npm run dev        # Next.js dev server on port 3000
npm run build      # production build
npm start          # serve production build
npm run lint       # ESLint (next/core-web-vitals)
```

### Environment Variables

**Backend `.env`** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLIENT_URL`, `MONGO_URL`, `PORT`, `JWT_SECRET`, `SESSION_SECRET`, `COOKIE_KEY_1`, `COOKIE_KEY_2`, `ORIGIN_1`–`ORIGIN_4`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `NODE_ENV`

**Frontend `.env`** — `NEXT_PUBLIC_API_URL`

---

## Project Structure

```
bento-clone/
├── CLAUDE.md
├── .prettierrc
├── README.md
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js              # entry point (dotenv, listen)
│       ├── app.js                 # Express config (middleware stack)
│       ├── authMiddleware.js      # JWT verification middleware
│       ├── models/
│       │   ├── user.model.js      # User schema (username, email, password, googleId)
│       │   └── porfile.model.js   # Profile schema (note: filename typo is intentional)
│       ├── routes/
│       │   ├── auth.router.js     # signup, login, Google OAuth, password reset
│       │   ├── auth.controller.js
│       │   ├── profile.router.js  # profile CRUD
│       │   ├── profile.controller.js
│       │   ├── token.router.js    # crypto price proxy
│       │   └── token.controller.js
│       ├── services/
│       │   └── mongo.js           # mongoose.connect
│       └── utils/
│           └── cloudinary.js      # cloudinary config
└── frontend/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── jsconfig.json              # @/* path alias
    ├── .eslintrc.json
    ├── pages/
    │   ├── index.js               # landing page (GSAP animations, static props)
    │   ├── [...id]/index.js       # profile page (~983 lines, main app page)
    │   ├── login.js
    │   ├── signup.js
    │   ├── reset-password.js
    │   └── user.js
    ├── components/                # flat directory, all .jsx files
    │   ├── Avatar.jsx
    │   ├── SocialLinkCard.jsx     # dual-mode: username-based & full-URL links
    │   ├── AddSocialLinkCard.jsx  # add/edit social links with URL validation
    │   ├── TokenPriceCard.jsx
    │   ├── ContractAddressCard.jsx
    │   ├── DexLinkCard.jsx
    │   ├── ResizingContainer.jsx
    │   └── ...
    ├── store/
    │   ├── index.js               # configureStore (ui + profile slices)
    │   ├── ui-slice.js            # isfirstTime, isSameUser
    │   └── profile-slice.js       # socialLinks, profileDetails, name, bio, avatar, theme
    ├── utils/
    │   └── axiosjwt.js            # axios instance with Bearer JWT from cookies
    ├── assets/                    # SVG icons
    └── styles/
        ├── globals.css            # Tailwind directives + custom loader
        └── styles.scss            # custom animations/gradients
```

---

## Architecture Decisions

### Data Fetching is Client-Side

Profile data is fetched in `useEffect` inside `pages/[...id]/index.js`, **not** via `getServerSideProps`. The `getServerSideProps` only calls `resetServerContext()` for react-beautiful-dnd. This means profile pages are not SSR'd — keep this in mind for SEO considerations.

### Widget Storage Model

All widgets (social links, text, image, title, links, crypto) are stored in a single `profiles` array on the Profile document. Each widget has a `type` enum field. This is a **polymorphic embedded array** — different widget types share the same array with type-specific fields.

Active widget types: `socialLink`, `text`, `image`, `title`, `links`, `tokenPrice`, `contractAddress`, `dexLink`

> **Note:** `map` remains in the Mongoose enum for backward compatibility with existing database documents, but is no longer created or rendered by the frontend. The map widget, MapBox component, and all Mapbox dependencies have been removed.

### Social Links — Dual-Mode (`isFullUrl` Flag)

Social links support two modes controlled by the `isFullUrl` boolean on each link object:

- **`isFullUrl: false`** (username-based) — X, Github. URL constructed as `https://{baseUrl}.com/{userName}`.
- **`isFullUrl: true`** (full-URL) — Docs, Official Site, Blog, Token, Brand Kit. The `userName` field stores the complete URL directly.

The 7 social link types (defined in `frontend/constant/index.js`):

| ID | Label | Mode | Color |
|----|-------|------|-------|
| `x` | X | username | `#000000` |
| `docs` | Docs | full URL | `#4A5568` |
| `github` | Github | username | `#181717` |
| `officialsite` | Official Site | full URL | `#2B6CB0` |
| `blog` | Blog | full URL | `#38A169` |
| `token` | Token | full URL | `#D69E2E` |
| `brandkit` | Brand Kit | full URL | `#805AD5` |

Icons use inline SVG data URIs (except Github which uses a Cloudinary-hosted SVG). Button text is "Visit" (not "Follow").

### Authorization Pattern

Backend routes use a `verifyUsernameMatch(token, urlUsername)` helper that decodes the JWT and checks the username matches the URL param. The `authMiddleware` validates the JWT exists; individual controllers verify ownership.

### Drag-and-Drop Reorder

When widgets are reordered, the **entire `profiles` array** is sent via `PUT /profile/replace/:username`. This is a full replacement, not a positional update.

### Image Uploads

Images go through the backend to Cloudinary. The frontend sends base64 data; the controller uploads to Cloudinary and stores the returned URL.

### Crypto Price Caching

Token prices from CoinGecko (with DexScreener fallback) are cached in-memory on the backend with a 5-minute TTL.

---

## Code Conventions

### Formatting (Prettier)

- Single quotes
- Bracket spacing enabled
- JSX bracket on same line
- Config in `.prettierrc` at project root

### Frontend

- **Components**: PascalCase `.jsx` files in a flat `components/` directory (e.g., `TokenPriceCard.jsx`)
- **Pages**: lowercase `.js` files (e.g., `login.js`, `reset-password.js`)
- **Imports**: use `@/` path alias (maps to `frontend/` root via `jsconfig.json`)
  ```js
  import { axiosWithToken } from '@/utils/axiosjwt';
  import { profileActions } from '@/store/profile-slice';
  ```
- **State**: Redux Toolkit slices — dispatch actions from components, no thunks
  ```js
  const dispatch = useDispatch();
  dispatch(profileActions.updateAvatar(data));
  ```
- **Styling**: Tailwind utility classes inline, dark mode via `dark:` prefix (class strategy)
  ```jsx
  <div className="p-4 dark:bg-[#2a2a2a] dark:text-white rounded-[24px]">
  ```
- **Component pattern**: arrow function + destructured props + default export
  ```jsx
  const MyComponent = ({ prop1, prop2 }) => { ... };
  export default MyComponent;
  ```
- **ESLint**: extends `next/core-web-vitals` with `exhaustive-deps`, `no-unescaped-entities`, and `display-name` rules turned off

### Backend

- **Module system**: CommonJS (`require` / `module.exports`)
- **Route pattern**: router file imports controller, applies `authMiddleware` before protected routes
- **All write operations** use Mongoose transactions (`startSession → startTransaction → commitTransaction / abortTransaction`)
- **Error responses**: consistent `res.status(code).json({ message: '...' })`
- **File naming**: `*.router.js` for routes, `*.controller.js` for handlers, `*.model.js` for schemas

---

## Do's and Don'ts

### Do

- Use `@/` imports in frontend code
- Use Mongoose transactions for any backend write operation
- Follow the existing widget type pattern when adding new widget types (add to Profile schema enum, create card component, add handler in `[...id]/index.js`)
- Use Tailwind utility classes for styling; use `dark:` variants for dark mode
- Keep components in the flat `components/` directory
- Use `axiosWithToken` from `@/utils/axiosjwt` for authenticated API calls
- Dispatch Redux actions directly from components (no thunks)
- Check `verifyUsernameMatch` in controllers to ensure users can only modify their own profile
- Include `isFullUrl` when adding or updating social link objects in the backend
- Use the `isFullUrl` flag to branch URL construction and input behavior in social link components

### Don't

- Don't add SSR data fetching to the profile page without understanding the current client-side architecture
- Don't use ES modules (`import`/`export`) in backend code — it's CommonJS
- Don't skip Mongoose transactions for write operations — the codebase consistently uses them
- Don't store secrets or `.env` files in git (frontend `.gitignore` already blocks `.env`)
- Don't rename `porfile.model.js` — the typo is baked into imports across the codebase
- Don't create subdirectories inside `components/` — the convention is a flat structure
- Don't use `getServerSideProps` for data fetching on the profile page — it only does `resetServerContext()`
- Don't bypass `authMiddleware` for routes that modify user data
- Don't use inline styles — use Tailwind classes instead
- Don't remove `'map'` from the Mongoose schema enum — existing database documents may contain map entries, and removing it causes 500 errors on save
- Don't re-add map widget functionality (MapBox component, Mapbox dependencies) — it has been intentionally removed
