# LET'S LVL

**Dubai's boldest e-commerce destination for fashion, merchandise, and limited-edition retail.**

Fashion + Merchandise + Live Auctions | Dubai, UAE | 2025

**Live:** [https://letslvl.vercel.app](https://letslvl.vercel.app)

**Tech Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase + Stripe

**Current Version:** v0.6.1 | [Releases](https://github.com/sabdelmaksoud1993/LETSLVL/releases)

---

## Release History

| Version | Date | Highlights |
|---------|------|------------|
| **v0.6.1** | 2026-03-27 | Promo codes management (CRUD + Supabase), split commission rates (products vs auctions) |
| **v0.6.0** | 2026-03-27 | Full Admin Panel (8 pages), user/seller/order/product/stream management, disputes, platform settings |
| **v0.5.0** | 2026-03-27 | 30 products seeded, full-text search, web push notifications, Stripe Connect, React Native mobile app scaffold, PWA manifest |
| **v0.4.0** | 2026-03-27 | Full Supabase wiring, Realtime auctions/chat, Stripe payments, Arabic/RTL, image upload |
| **v0.3.0** | 2026-03-27 | Supabase backend (10 tables), real auth (signup/login/session), middleware |
| **v0.2.0** | 2026-03-27 | Header/footer fix, Sign In/Up buttons, seller CRUD, analytics dashboard |
| **v0.1.0** | 2026-03-27 | Full frontend MVP — 20 pages, commerce, live tab, seller dashboard |

---

## Quick Start

```bash
cd web
npm install
npm run dev
# Open http://localhost:3000
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase and Stripe keys.

### What's Working (v0.4.0)

| Feature | Status |
|---------|--------|
| Fashion e-commerce (browse, search, product pages) | Live (Supabase-backed) |
| Cart + Checkout with real order creation | Live |
| User auth (signup, login, session, OAuth-ready) | Live |
| Seller product CRUD (add, edit, archive) | Live |
| Seller analytics dashboard | Live |
| Live auction tab (Trofee-style feed) | Live |
| Real-time chat in streams | Live (Supabase Realtime) |
| Real-time bidding in auctions | Live (Supabase Realtime) |
| Stripe payments (Card, COD, Tabby BNPL) | Live (dev mode) |
| Image upload (drag-and-drop) | Live (Supabase Storage) |
| Arabic/RTL language support | Live |
| Wishlist (user-tied, persistent) | Live |
| Go Live (seller creates stream) | Live |
| Full-text product search | Live |
| Web push notifications | Live (PWA) |
| Stripe Connect seller payouts | Live (dev mode) |
| 30 products seeded in database | Live |
| React Native mobile app | Scaffolded (Expo + 5 tabs) |
| Admin Panel (overview, users, sellers, orders, products, streams, disputes, settings) | Live |
| Promo codes management (create, activate/deactivate, track usage) | Live |
| Split commission rates (standard products vs live auctions) | Live |

---

## Mobile App

The React Native mobile app is in `mobile/` — built with Expo and expo-router.

```bash
cd mobile
npm install
npx expo start
```

5-tab layout: Home, Explore, LIVE, Wishlist, Account. Shares the same Supabase backend as the web app.

---

## Vision

LET'S LVL exists at the intersection of style and culture — where every drop matters and every bid is a statement. We are not just a marketplace. We are a movement. A platform where brands with real energy find buyers who feel it. Built in the UAE, shaped by global retail culture.

The platform combines **Namshi-style fashion e-commerce** (web + mobile) with a **Trofee-style live auction tab** where sellers go live on camera, showcase products in real-time, and buyers bid, chat, and purchase — all within one app.

---

## Table of Contents

- [Brand Identity](#brand-identity)
- [Platform Overview](#platform-overview)
- [SDLC V-Model Plan](#sdlc-v-model-plan)
  - [Phase 1: Business Requirements Analysis](#phase-1--business-requirements-analysis)
  - [Phase 2: System Requirements Specification](#phase-2--system-requirements-specification-srs)
  - [Phase 3: High-Level Architecture Design](#phase-3--high-level-architecture-design)
  - [Phase 4: Module / Component Design](#phase-4--module--component-design)
  - [Phase 5: Implementation](#phase-5--implementation-center-of-the-v)
  - [Phase 6: Unit Testing](#phase-6--unit-testing)
  - [Phase 7: Integration Testing](#phase-7--integration-testing)
  - [Phase 8: System Testing](#phase-8--system-testing)
  - [Phase 9: User Acceptance Testing](#phase-9--user-acceptance-testing-uat)
- [Risk Register](#risk-register)
- [Delivery Timeline](#delivery-timeline)
- [Team Structure](#team-structure)
- [Brand Guidelines Summary](#brand-guidelines-summary)
- [Reference Platforms](#reference-platforms)

---

## Brand Identity

> See full brand guidelines in [`docs/BRAND_GUIDELINES.md`](docs/BRAND_GUIDELINES.md) and the [Brand Book PDF](docs/LetsLVL_BrandBook.pdf).

### Core Pillars

| # | Pillar | Description |
|---|--------|-------------|
| 01 | **Bold by Design** | Every decision — visual, verbal, product — is made with conviction. We don't do average. |
| 02 | **Culture-First** | Rooted in fashion and retail culture. We speak the language of the community fluently. |
| 03 | **Scarcity as Energy** | Limited drops, live auctions, real urgency. Exclusivity becomes an experience, not a price tag. |
| 04 | **UAE-Powered** | Based in Dubai, connected to the world. The regional hub for global fashion and retail culture. |

### Color System

| Color | Hex | Usage |
|-------|-----|-------|
| **LVL Yellow** | `#F5C518` | Headlines, CTAs, accent bars. Min 18px for text. Never on white backgrounds. |
| **Pitch Black** | `#0A0A0A` | Primary background. All brand materials default to black. |
| **Pure White** | `#FFFFFF` | Body text on dark, UI labels across all digital touchpoints. |
| **Carbon** | `#1A1A1A` | Dark backgrounds & cards. |
| **Slate** | `#2D2D2D` | UI panels & dividers. |
| **Smoke** | `#AAAAAA` | Body text & captions. |

**Color Ratio:** 60% Black / 30% White / 10% Yellow. Yellow should always feel earned.

### Typography

| Level | Font | Size | Usage |
|-------|------|------|-------|
| Display | Bold Condensed | 85px | Hero headlines, all caps, slide titles, campaign copy |
| Headline / Labels | Condensed Regular | 36px | Subheads, callouts, UI labels, product tags |
| Body | Poppins Light / Regular | 14-18px | Body copy, descriptions, emails, reports |

**Type Scale:** Hero Headline (85px) > Section Title (64px) > Page Heading (36px) > Subheading (18px) > Body (14px) > Label/Caption/Metadata (10px)

---

## Platform Overview

### What We're Building

A single platform for the MENA region where users can:

1. **Browse and buy fashion** (Namshi-style) — clean e-commerce experience with search, filters, cart, checkout, order tracking, returns
2. **Join live auctions** (Trofee-style) — a dedicated LIVE tab where sellers open their camera, speak to viewers, showcase products in real-time, and buyers bid, chat, and buy instantly

### How the Live Tab Works

The live auction experience works like this: **a seller (blogger/merchant) opens their phone camera and goes live**. They physically show products, talk about them, interact with viewers in real-time chat, and run auctions with countdown timers. Buyers scroll through a feed of active live streams (similar to TikTok/Reels format), tap into one, and can:

- Watch the live stream
- Chat with the seller and other viewers
- Bid on auction items with real-time countdown timers
- Buy items instantly at a fixed "Buy Now" price
- Get notified when they're outbid

Categories include: Trading Card Games, Sports Cards, Fashion, Streetwear, Vintage, Collectibles (Pokemon, One Piece, Dragon Ball, Magic TCG, UFC, Basketball).

### Platform Matrix

| Surface | Experience |
|---------|-----------|
| **Web App** (Desktop + Mobile Web) | Full Namshi-style fashion commerce: browse, search, filter, product pages, cart, checkout, orders, returns |
| **Mobile App** (iOS + Android) | Full commerce + **LIVE tab** with scrollable live stream feed, in-stream bidding, chat, and instant purchase |

---

## SDLC V-Model Plan

```
VERIFICATION (Left Side)                VALIDATION (Right Side)
─────────────────────────────────────────────────────────────────
Phase 1: Business Requirements    <──>    Phase 9: User Acceptance Testing
Phase 2: System Requirements      <──>    Phase 8: System Testing
Phase 3: Architecture Design      <──>    Phase 7: Integration Testing
Phase 4: Module Design            <──>    Phase 6: Unit Testing
                      Phase 5: Implementation
                           (CENTER / BOTTOM)
```

Each left-side phase has a direct testing counterpart on the right side. Requirements trace directly to acceptance criteria.

---

### Phase 1 — Business Requirements Analysis

> Validates against: **Phase 9 — User Acceptance Testing**

#### Target Users

| Persona | Description |
|---------|-------------|
| **Shopper** | Browses fashion, adds to cart, buys instantly or via live auction |
| **Bidder** | Joins live streams, bids in real-time auctions, chats with sellers |
| **Seller** | Goes live on camera, lists products, manages inventory and fulfillment |
| **Admin** | Manages platform, vets sellers, handles disputes |

#### Core Business Requirements

**BR-01 — Fashion Commerce (Namshi Layer)**
- Browse 2,000+ products across fashion categories
- Search with filters (category, size, brand, price, color)
- Product detail pages with multi-angle imagery and size guides
- Cart, wishlist, and checkout with COD + card + BNPL (Tabby)
- Order tracking with 2-hour to next-day delivery (UAE)
- 14-day returns with buyer protection
- Loyalty/rewards tier system
- Arabic + English bilingual support

**BR-02 — Live Auction Tab (Trofee Layer)**
- Dedicated "LIVE" tab in the mobile app bottom navigation
- Scrollable feed of active live streams showing: thumbnail preview, seller name, viewer count, category, current bid
- Categories: Trading Card Games, Sports Cards, Fashion, Streetwear, Vintage, Toys & Collectibles
- Seller goes live via phone camera — speaks, shows products, interacts with viewers
- Real-time bidding with server-authoritative countdown timers
- Buy-Now option during streams for fixed-price items
- Live chat overlay with seller and viewer interaction
- Seller giveaways and engagement tools (lucky draws, milestones)
- Pre-vetted sellers with Buyer Guarantee

**BR-03 — Cross-Platform**
- Web app (desktop + mobile web): Namshi-style primary commerce
- Mobile app (iOS + Android): Full commerce + LIVE tab
- Cross-device cart and wishlist sync

**BR-04 — MENA-Specific**
- Markets: UAE, KSA, Kuwait, Oman, Bahrain, Qatar
- Currencies: AED, SAR, KWD
- COD support with regional limits
- Arabic RTL layout support
- WhatsApp-based notifications and support

#### Success Metrics (KPIs)

| Metric | Target |
|--------|--------|
| Conversion rate | >=3.5% |
| Live stream avg watch time | >=8 minutes |
| Live auction GMV share | >=30% of total within 12 months |
| Seller retention | >=70% active after 3 months |
| App rating | >=4.2 stars |
| 2-hour delivery SLA (Dubai) | >=90% |

---

### Phase 2 — System Requirements Specification (SRS)

> Validates against: **Phase 8 — System Testing**

#### Functional Requirements

**FR-01: User Management**
- Registration via email, phone (OTP), Google, Apple Sign-In
- Profile: name, photo, size preferences, saved addresses
- Seller account upgrade with trade license + VAT verification
- Role-based access: Shopper, Seller, Admin, Moderator

**FR-02: Product Catalog**
- Product CRUD with multi-image upload (up to 10 images + video)
- SKU management with size/color variants
- Real-time inventory sync across all channels (web, app, live stream)
- Elasticsearch-powered search with faceted filters
- Visual search (upload photo to find similar products)

**FR-03: Cart & Checkout**
- Persistent cart (cross-device sync via user account)
- Guest checkout with order tracking via email/phone
- Payment methods: Visa/MC, Mada, Apple Pay, Google Pay, Tabby (BNPL), COD
- Address management with Google Maps autocomplete
- Promo codes and vouchers

**FR-04: Orders & Logistics**
- Order state machine: placed > confirmed > packed > shipped > delivered > returned
- Multi-carrier integration (Aramex, Fetchr, DHL)
- Real-time tracking via carrier webhooks
- Returns portal: initiate, schedule pickup, track refund
- LVL Wallet for refund credits

**FR-05: Live Stream Module**
- Seller goes live from mobile app (RTMP ingest via phone camera)
- Viewer discovery feed: scrollable cards showing live stream thumbnail, viewer count, category, seller name
- Stream player: HLS/LL-HLS delivery (2-5s latency for general viewing, WebRTC data channel for auction events)
- Live chat: WebSocket-based, pub/sub (Redis), supports 10,000+ concurrent messages per stream
- Auction engine: create lot > open bidding > countdown timer > winner determination > payment capture
- Buy-Now: fixed-price instant purchase during stream
- Giveaway tool: countdown timer, entry mechanics, winner picker

**FR-06: Bidding & Auction Engine**
- Server-authoritative clock (no client clock trust)
- Bid submission with optimistic UI + server confirmation
- Anti-snipe logic: auction extends by 10s if bid placed in last 10s
- Reserve price support (private threshold)
- Bid history log visible to all viewers
- Auto-checkout for auction winners within 10 minutes

**FR-07: Notifications**
- Push (FCM/APNs): order updates, outbid alerts, stream going live
- WhatsApp (Twilio): order shipped, delivery confirmation
- Email: order confirmation, return status, weekly deals
- In-app notification center

**FR-08: Seller Dashboard**
- Inventory management with bulk CSV/API import
- Pre-stream checklist (title, category, products, thumbnail)
- Real-time stream metrics: concurrent viewers, bids/min, GMV
- Post-stream analytics: replay views, top products, revenue breakdown
- Payout management: weekly settlements, transaction history

**FR-09: Admin Panel**
- Seller onboarding & vetting workflow
- KYC document review
- Dispute resolution queue
- Content moderation for live streams (flag, mute, ban)
- Platform analytics dashboard

#### Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Product page: <1.5s load. Live feed: <3s initial load |
| **Latency** | Auction bid acknowledgment: <200ms. Chat delivery: <100ms |
| **Availability** | 99.9% uptime SLA. Live streams: 99.5% |
| **Scalability** | 100K concurrent users. 10K concurrent viewers per stream |
| **Security** | PCI-DSS Level 1 for payments. HTTPS/TLS everywhere. OWASP Top 10 |
| **Localization** | Arabic (RTL) + English. Regional currency formatting |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Compliance** | UAE PDPL data privacy law. VAT compliance for KSA/UAE |

---

### Phase 3 — High-Level Architecture Design

> Validates against: **Phase 7 — Integration Testing**

#### System Architecture

```
+-----------------------------------------------------------+
|                        CLIENTS                            |
|  Web App (Next.js)    iOS App (React Native)    Android   |
+-----------------------------+-----------------------------+
                              |
                     +--------v--------+
                     |   API Gateway   |  (Kong / AWS API GW)
                     |   + Auth (JWT)  |
                     +--------+--------+
                              |
          +-------------------+-------------------+
          |                   |                   |
   +------v------+    +------v-------+    +------v-------+
   |  Commerce   |    |   Live &     |    |   Auction    |
   |  Service    |    |  Streaming   |    |   Engine     |
   |  (Node.js)  |    |  Service     |    |   (Elixir)   |
   +------+------+    |  (Go/Node)   |    +------+-------+
          |           +------+-------+           |
          |                  |                   |
   +------v------------------v-------------------v------+
   |            MESSAGE BUS (Kafka / RabbitMQ)          |
   +----------------------------------------------------+
          |                  |                   |
   +------v------+   +------v-------+   +-------v------+
   |  PostgreSQL  |   |    Redis     |   | Elasticsearch|
   |  (primary)   |   | (cache+pub/ |   |   (search)   |
   |              |   |  sub+timer)  |   +--------------+
   +--------------+   +--------------+
          |
   +------v-------------------------------------------------+
   |             STREAMING INFRASTRUCTURE                    |
   |   RTMP Ingest -> Transcoder -> LL-HLS via CDN          |
   |   (Amazon IVS or Mux)                                  |
   +--------------------------------------------------------+
```

#### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Web Frontend** | Next.js 15 (App Router) | SSR for SEO (fashion catalog), fast hydration |
| **Mobile** | React Native + Expo | Code sharing with web, large MENA dev pool |
| **Commerce API** | Node.js + TypeScript + GraphQL | Flexible queries for product catalog |
| **Auction Engine** | Elixir + Phoenix Channels | Actor model perfect for concurrent auction state |
| **Live Streaming** | Amazon IVS (RTMP in, HLS out) | Managed, sub-3s latency, scales automatically |
| **Real-time Chat** | WebSocket + Redis Pub/Sub | 10K+ messages/stream, horizontally scalable |
| **Search** | Elasticsearch | Faceted search, Arabic text analysis |
| **Primary DB** | PostgreSQL | Relational, ACID transactions for orders/payments |
| **Cache** | Redis | Session, cart, product cache, pub/sub |
| **CDN** | CloudFront | Global edge for product images and stream delivery |
| **Payments** | Stripe + Tabby + COD | Global cards + BNPL + regional COD |
| **Notifications** | FCM + APNs + Twilio (WhatsApp) | Multi-channel MENA notification stack |
| **Infrastructure** | AWS (GCC region - Bahrain) | Low latency for UAE/KSA, data residency |

#### Key Integrations

- **Carrier APIs**: Aramex, Fetchr, DHL (order fulfillment webhooks)
- **Payment Gateways**: Stripe, Tabby, Apple Pay, Google Pay
- **KYC/Identity**: Shufti Pro or Jumio (seller vetting)
- **Maps**: Google Maps API (address autocomplete, delivery zones)
- **Analytics**: Mixpanel (user behavior) + Metabase (business KPIs)

---

### Phase 4 — Module / Component Design

> Validates against: **Phase 6 — Unit Testing**

#### Frontend Component Architecture

```
src/
├── app/                        # Next.js App Router pages
│   ├── (commerce)/             # Fashion shopping routes
│   │   ├── page.tsx            # Home feed
│   │   ├── category/[slug]/    # Category browse
│   │   ├── product/[id]/       # Product detail
│   │   ├── cart/               # Cart page
│   │   └── checkout/           # Checkout flow
│   ├── (live)/                 # Live stream routes (web preview)
│   │   ├── page.tsx            # Live feed
│   │   └── stream/[id]/        # Individual stream
│   ├── account/                # User account, orders, wishlist
│   └── seller/                 # Seller dashboard
│
├── components/
│   ├── commerce/               # ProductCard, FilterBar, CartDrawer
│   ├── live/                   # StreamCard, BidButton, ChatOverlay, AuctionTimer
│   ├── ui/                     # Design system: Button, Modal, Input
│   └── layout/                 # Header, BottomNav, Sidebar
│
├── features/
│   ├── auction/                # Bid state machine, optimistic UI
│   ├── stream/                 # HLS player, WebSocket chat connection
│   ├── cart/                   # Cart state, persistence
│   └── auth/                   # Auth context, JWT refresh
│
└── lib/
    ├── api/                    # GraphQL client (commerce)
    ├── websocket/              # WebSocket connection manager
    └── analytics/              # Event tracking
```

#### Mobile App Tab Structure

```
Bottom Navigation:
+----------+----------+----------+----------+----------+
|   Home   | Explore  |   LIVE   | Wishlist | Account  |
|  (Feed)  | (Browse) |    Tab   |   (♡)    |          |
+----------+----------+----------+----------+----------+

LIVE Tab Layout (Trofee-style):
+-------------------------------+
|  [LIVE] [Upcoming] [Ended]    |    <-- filter tabs
+-------------------------------+
| Category pills:               |
| [All] [Trading Card Games]    |
| [Sports Cards] [Fashion]      |
| [Toys & Collectibles]         |
+-------------------------------+
|  +-------------------------+  |
|  |  LIVE STREAM CARD       |  |    <-- scroll vertically
|  |  [Thumbnail Preview]    |  |
|  |  Seller name + flag     |  |
|  |  Stream title           |  |
|  |  Current bid: 350 AED   |  |
|  |  Timer: 2:34 remaining  |  |
|  +-------------------------+  |
|  +-------------------------+  |
|  |  LIVE STREAM CARD       |  |
|  |  ...                    |  |
|  +-------------------------+  |
+-------------------------------+

Inside a Live Stream (Full Screen):
+-------------------------------+
|  [Live Video - Seller Camera] |
|                               |
|  Chat overlay (scrolling) --> |
|                               |
|  +-------------------------+  |
|  | Current Item: Air Max   |  |
|  | Bid: 420 AED   T: 0:45 |  |
|  | [  BID 450 AED  ]      |  |
|  | [ BUY NOW 500 AED ]    |  |
|  +-------------------------+  |
+-------------------------------+
```

#### Backend Services

**Commerce Service (Node.js/TypeScript)**
- `ProductRepository` — CRUD, search, inventory management
- `CartService` — add/remove/update, promo code validation
- `OrderService` — state machine, carrier integration
- `PaymentService` — Stripe/Tabby/COD abstraction
- `SearchService` — Elasticsearch queries with Arabic support

**Auction Engine (Elixir)**
- `AuctionServer` (GenServer per auction) — isolated auction state
- `BidValidator` — anti-snipe logic, reserve price check
- `TimerManager` — server-authoritative countdown
- `AuctionSupervisor` — crash recovery, state persistence

**Stream Service (Node.js + Amazon IVS)**
- `StreamController` — create/start/stop stream sessions
- `ChatGateway` (WebSocket) — pub/sub via Redis
- `DiscoveryService` — active stream feed, sorting algorithm
- `GiveawayService` — timer, entry, winner selection

#### Data Models (Key Entities)

```
User       { id, email, phone, role, walletBalance, tier, preferences }
Product    { id, sellerId, title, images[], price, inventory, variants[] }
Order      { id, userId, items[], status, payment, tracking, carrier }
Stream     { id, sellerId, title, category, status, rtmpKey, viewerCount }
Auction    { id, streamId, productId, startPrice, currentBid, endTime, winnerId }
Bid        { id, auctionId, userId, amount, timestamp, status }
```

---

### Phase 5 — Implementation (Center of the V)

#### Development Approach: Feature-Sliced, Sprint-Based

**Sprint 0 (2 weeks) — Foundation**
- Monorepo setup (Turborepo: web + mobile + API + auction-engine)
- CI/CD pipeline (GitHub Actions -> AWS ECS)
- Auth service (JWT + refresh tokens + OAuth)
- Design system: LVL Yellow (#F5C518) + Pitch Black (#0A0A0A), Bold Condensed + Poppins
- Docker Compose local dev environment

**Sprint 1-2 (4 weeks) — Commerce Core**
- Product catalog API + Elasticsearch
- Product browsing + PDP (web + mobile)
- Cart + checkout flow
- Payment integration (Stripe + Tabby)
- Order management + carrier webhooks

**Sprint 3 (2 weeks) — Account & Orders**
- User profile, addresses, order history
- Returns portal
- Rewards/wallet system
- WhatsApp + push notifications

**Sprint 4-5 (4 weeks) — Live Stream Foundation**
- Amazon IVS integration (RTMP ingest from seller phone camera + HLS playback)
- Live feed discovery (web + mobile LIVE tab with Trofee-style layout)
- In-stream chat (WebSocket + Redis pub/sub)
- Stream player component (full-screen mobile, embedded web)

**Sprint 6-7 (4 weeks) — Auction Engine**
- Elixir auction GenServer
- Real-time bid UI with optimistic updates
- Server-authoritative countdown timer
- Anti-snipe, reserve price, winner flow
- Auto-checkout for auction winners

**Sprint 8 (2 weeks) — Seller Tools**
- Seller onboarding + KYC
- Seller dashboard (inventory, go-live, analytics)
- Giveaway tool
- Pre-stream checklist

**Sprint 9 (2 weeks) — Arabic/RTL + MENA Polish**
- Full Arabic translation + RTL layout
- COD + Mada payment methods
- Regional currency formatting
- UAE-specific same-day delivery logic

**Sprint 10 (2 weeks) — Performance & Hardening**
- Load testing (k6): 100K concurrent users
- Auction engine stress test: 10K concurrent bidders
- CDN optimization, image compression
- Security audit (OWASP)

---

### Phase 6 — Unit Testing

> Validates: Module Design (Phase 4)

**Coverage Target: >=80% across all services**

#### Commerce Service
- `ProductRepository`: CRUD ops, inventory decrement, SKU variant logic
- `CartService`: add/remove/merge (guest to auth), promo validation
- `OrderService`: state machine transitions, invalid state rejection
- `PaymentService`: Stripe mock, Tabby installment calculation, COD limit check

#### Auction Engine (Elixir ExUnit)
- `BidValidator`: valid bid increment, below-reserve rejection, duplicate bid
- `TimerManager`: countdown accuracy, extension on late bid (anti-snipe)
- `AuctionServer`: state transitions (open > closing > closed), crash recovery
- `WinnerDetermination`: highest bidder, tie-break logic

#### Stream Service
- `ChatGateway`: message delivery, profanity filter, rate limiting
- `DiscoveryService`: sort by viewer count, category filter, pagination
- `GiveawayService`: entry validation, fair winner selection

#### Frontend (Vitest + React Testing Library)
- `BidButton`: disabled when outbid, loading during submission
- `AuctionTimer`: displays correct time, pulses red under 10s
- `StreamCard`: renders thumbnail, live badge, viewer count
- `CartDrawer`: item add/remove, subtotal calculation
- `CheckoutForm`: validation, payment method selection

---

### Phase 7 — Integration Testing

> Validates: Architecture Design (Phase 3)

#### Test Suites

**Commerce <> Inventory Sync**
- Place order -> inventory decrements across web, mobile, live stream simultaneously
- Concurrent purchases: only one succeeds when last unit sold
- Return processed -> inventory restored

**Auction Engine <> Payment Gateway**
- Auction winner -> Stripe payment capture -> order created -> fulfillment triggered
- Payment failure -> auction winner notified -> fallback to 2nd highest bidder
- Auto-checkout timeout -> item re-listed

**Stream Service <> Auction Engine**
- Go live -> stream active -> auction created within stream
- Auction closed -> stream continues seamlessly
- Stream ends mid-auction -> auction gracefully closes, bids preserved

**Notification Pipeline**
- Outbid -> push notification within 500ms
- Seller goes live -> followed users notified within 2s
- Order shipped -> WhatsApp delivered within 60s

**Payment <> Wallet**
- Refund issued -> LVL Wallet credited instantly
- Wallet balance applied at checkout -> correct deduction
- Tabby installment creation -> order confirmed on approval

#### API Contract Tests (Pact)
- Web <> Commerce API
- Mobile <> Stream API
- Auction Engine <> Payment Service

---

### Phase 8 — System Testing

> Validates: System Requirements (Phase 2)

#### Performance Testing (k6)

```
Scenarios:
  fashion_browse:  80,000 VUs for 30 min
  live_auction:    15,000 VUs for 30 min
  checkout_flow:    5,000 VUs for 30 min

Thresholds:
  http_req_duration:  p95 < 1500ms  (product page)
  bid_ack_duration:   p99 < 200ms   (bid acknowledgment)
  chat_latency:       p99 < 100ms   (chat delivery)
```

#### Security Testing
- OWASP ZAP automated scan on all API endpoints
- SQL injection testing on product search, checkout
- JWT token forgery attempts
- Bid manipulation (negative bids, past-deadline bids)
- Stream key theft / unauthorized RTMP ingest
- Payment replay attacks

#### Functional System Tests
- Complete buyer journey: browse > add to cart > checkout > track > return
- Complete bidder journey: join stream > bid > win auction > auto-checkout > receive item
- Complete seller journey: onboard > list products > go live on camera > auction > fulfillment > payout
- Edge cases: network drop mid-auction, payment failure, stream interruption

#### Localization Testing
- Arabic RTL layout integrity across all screens
- Currency formatting: AED, SAR, KWD
- COD limit enforcement by country
- Date/time format (Gregorian)

#### Device & Browser Matrix
- iOS 16+ (iPhone 13, 14, 15 Pro)
- Android 12+ (Samsung Galaxy S22, Pixel 7)
- Web: Chrome, Safari, Firefox, Edge (latest 2 versions)
- Mobile web: Safari iOS, Chrome Android

---

### Phase 9 — User Acceptance Testing (UAT)

> Validates: Business Requirements (Phase 1)

#### Beta Program: 500 users (UAE/KSA split)

| Segment | Count | Behavior |
|---------|-------|----------|
| Fashion shoppers | 200 | Namshi-style browsing and buying |
| Live auction participants | 150 | Trofee-style bidding and live interaction |
| Sellers | 100 | Mix of fashion and collectibles sellers going live |
| Power users | 50 | Both commerce and live auction |

#### Acceptance Criteria

| BR | Scenario | Pass Criteria |
|----|----------|---------------|
| BR-01 | User browses, filters, and purchases a product | Order placed, confirmation received, tracking link active |
| BR-01 | BNPL via Tabby splits payment into 4 | Tabby flow completes, order confirmed |
| BR-01 | Arabic user navigates fully in RTL | No layout breaks, all strings translated |
| BR-02 | User scrolls LIVE tab, joins a stream | Stream loads <3s, chat visible, bid button active |
| BR-02 | User wins auction | Auto-charged, order created, delivery initiated |
| BR-02 | Seller goes live from mobile camera | Stream visible to buyers within 30s of starting |
| BR-03 | Web user completes checkout | Same flow as mobile, cross-device cart sync works |
| BR-04 | UAE user selects COD | COD available, AED displayed, WhatsApp delivery confirmation |

#### Beta KPI Gates (Launch Go/No-Go)

- [ ] Beta user rating: >=4.0
- [ ] Live stream checkout conversion: >=5%
- [ ] Auction completion rate (winner pays): >=90%
- [ ] Critical bug count at launch: 0
- [ ] P1 bug resolution SLA: <24 hours during beta

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Streaming latency >5s in MENA | High | Amazon IVS Bahrain region; CDN edge nodes in UAE |
| Auction bid collision (two winners) | Critical | Elixir GenServer serializes all bids; DB-level optimistic locking |
| Seller goes offline mid-auction | High | Grace period (30s reconnect); auto-close with refund if stream lost |
| Payment fraud in live auctions | High | 3D Secure + velocity checks + bid deposit holds |
| Arabic RTL layout regression | Medium | RTL-specific Storybook stories; CI screenshot diff tests |
| MENA data residency compliance | High | AWS Bahrain region; no data leaves GCC |
| COD abuse (buyer refuses delivery) | Medium | COD limits enforced by country; repeat offender flags |

---

## Delivery Timeline

```
Month 1:   Foundation + Commerce Core (Sprint 0-2)
Month 2:   Commerce Polish + Account Features (Sprint 3)
Month 3:   Live Stream Foundation (Sprint 4-5)
Month 4:   Auction Engine (Sprint 6-7)
Month 5:   Seller Tools + Arabic/RTL (Sprint 8-9)
Month 6:   Performance Hardening + Security Audit (Sprint 10)
Month 7:   UAT Beta (500 users)
Month 8:   Bug fixes + App Store submission
Month 9:   Public Launch (UAE) -> expand to KSA
```

---

## Team Structure

| Role | Count | Responsible For |
|------|-------|-----------------|
| Product Manager | 1 | Requirements, backlog, UAT coordination |
| UI/UX Designer | 2 | Design system (LVL brand), Namshi aesthetic, LIVE tab UX |
| Frontend (Web) | 2 | Next.js commerce + live web preview |
| Mobile (React Native) | 2 | iOS + Android including LIVE tab |
| Backend (Node.js) | 2 | Commerce API, GraphQL, logistics integrations |
| Backend (Elixir) | 1 | Auction engine |
| DevOps / SRE | 1 | AWS infra, CI/CD, monitoring |
| QA Engineer | 2 | Test automation, UAT coordination |
| Arabic Translator | 1 | Localization, RTL QA |

---

## Brand Guidelines Summary

> Full guidelines: [`docs/BRAND_GUIDELINES.md`](docs/BRAND_GUIDELINES.md)

### Voice & Tone

**We Are:** Bold. Energetic. Culturally sharp. Confident. Inclusive.

**We Are Not:** Corporate or stiff. Aggressive or alienating. Try-hard. Vague. Excessive.

### Visual Rules

**Do:**
- Use black as the dominant background in all materials
- Pair LVL Yellow with black or white only
- Use the Display font (Bold Condensed) for all headline-level text
- Maintain generous whitespace
- Use high-contrast, bold photography — raw, real, energetic

**Don't:**
- Never use gradients in primary brand communications
- Never place the logo on patterned or photographic backgrounds
- Never use more than 3 font sizes in a single design
- Never use yellow text on white — zero contrast, illegible
- Never use soft, pastel, or washed-out colours

---

## Reference Platforms

| Platform | What We Take From It |
|----------|---------------------|
| **Namshi** (namshi.com) | Fashion e-commerce UX, product catalog, checkout flow, MENA payment methods, delivery infrastructure |
| **Trofee** (trofee.live) | Live auction tab UX, seller-goes-live-on-camera model, scrollable live feed, real-time bidding, category pills (Trading Card Games, Sports Cards, Fashion, Toys & Collectibles) |
| **WhatNot** (whatnot.com) | Auction mechanics, anti-snipe logic, seller authentication, giveaway tools |
| **TikTok Shop** | Product pinning during live, checkout-in-stream flow, algorithm-driven discovery |

---

## Repository Structure

```
LETSLVL/
├── README.md                          # Full V-model SDLC plan + project docs
├── docs/
│   ├── BRAND_GUIDELINES.md            # Brand guidelines for development
│   └── LetsLVL_BrandBook.pdf          # Original brand book PDF
└── web/                               # Next.js 16 web application
    ├── src/
    │   ├── app/
    │   │   ├── (commerce)/            # Fashion e-commerce pages
    │   │   │   ├── page.tsx           # Homepage
    │   │   │   ├── category/[slug]/   # Category browse
    │   │   │   ├── product/[id]/      # Product detail
    │   │   │   ├── cart/              # Shopping cart
    │   │   │   └── checkout/          # Checkout flow
    │   │   ├── live/                  # Live auction tab (Trofee-style)
    │   │   │   ├── page.tsx           # Live stream feed
    │   │   │   └── stream/[id]/       # Individual stream viewer
    │   │   ├── account/               # User account, orders, wishlist
    │   │   ├── seller/                # Seller dashboard, go-live, products
    │   │   └── auth/                  # Login, register
    │   ├── components/
    │   │   ├── ui/                    # Button, Badge, Input, Modal
    │   │   ├── commerce/              # ProductCard, CategoryPills
    │   │   ├── live/                  # StreamCard, ChatOverlay, AuctionPanel
    │   │   ├── layout/                # Header, Footer, BottomNav
    │   │   └── seller/                # Seller-specific components
    │   ├── lib/                       # Supabase client, cart store, utils
    │   └── types/                     # TypeScript type definitions
    └── public/                        # Static assets
```

---

**LET'S LVL** | Dubai, UAE | 2025 | partners@letslvl.com
