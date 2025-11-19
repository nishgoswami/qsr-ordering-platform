# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Customer    │  │   Kitchen    │  │    Admin     │        │
│  │   Web App    │  │  Tablet App  │  │  Dashboard   │        │
│  │ (Next.js 14) │  │  (PWA/Next)  │  │  (Next.js)   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  │                  │                │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase Backend                            │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │  │
│  │  │PostgreSQL│  │ Realtime │  │   Auth   │  │ Storage │ │  │
│  │  │  +PostGIS│  │WebSockets│  │   JWT    │  │   S3    │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │         Edge Functions (Serverless)              │   │  │
│  │  │  - WhatsApp notifications                        │   │  │
│  │  │  - Email sending                                 │   │  │
│  │  │  - Stripe webhooks                               │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ Stripe  │  │ Google   │  │  Twilio   │  │ O365/SMTP    │  │
│  │Payments │  │ Maps API │  │ WhatsApp  │  │    Email     │  │
│  └─────────┘  └──────────┘  └───────────┘  └──────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Thermal Printer (Optional Local Server)          │  │
│  │              ESC/POS Network Printers                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Application Flow

### Customer Order Flow
```
1. Browse Menu → 2. Add to Cart → 3. Select Order Type (Pickup/Delivery)
   ↓                    ↓                        ↓
4. Validate Timing → 5. Checkout → 6. Payment (Stripe)
   ↓                    ↓                        ↓
7. Order Created → 8. Kitchen Notified → 9. Printer Triggered
   ↓                    ↓                        ↓
10. Status Updates (Realtime) → 11. Customer Tracking → 12. Completion
```

### Kitchen Order Management
```
1. Receive Order (WebSocket) → 2. Audio Alert → 3. Print Kitchen Ticket
   ↓                                  ↓                    ↓
4. Accept Order → 5. Update Status → 6. Mark Complete
   ↓                                  ↓                    ↓
7. Customer Notified → 8. Update Dashboard → 9. Analytics
```

## 🗄️ Data Architecture

### Multi-Tenant Isolation
- **Row Level Security (RLS)** on all tables
- Organization ID filtering on every query
- JWT tokens contain user's organization_id
- No cross-tenant data leakage possible

### Real-time Data Flow
```
Order Created → PostgreSQL Trigger → Supabase Realtime Channel
                                            ↓
                        ┌───────────────────┴───────────────────┐
                        ↓                                       ↓
                Kitchen App Subscribed                Admin Dashboard
                (Auto-refresh UI)                     (Live updates)
```

## 🔐 Security Architecture

### Authentication
- **JWT-based** authentication via Supabase Auth
- **Role-based access control** (RBAC): admin, staff, customer
- **Email + password** or OAuth providers
- **Password reset** via email

### Authorization
- **Row Level Security (RLS)** policies on all tables
- Users can only access data for their organization
- Staff roles restricted by permissions
- API keys never exposed to frontend

### Data Encryption
- **In-transit:** TLS 1.3 for all connections
- **At-rest:** PostgreSQL encryption
- **Sensitive data:** PII encrypted at application layer
- **Payment data:** Never stored (Stripe tokenization)

## 📱 Frontend Architecture

### Monorepo Structure
```
apps/
├── customer-web/        # Public ordering site
│   ├── app/            # Next.js 14 App Router
│   ├── components/     # React components
│   ├── lib/            # Utilities & API clients
│   └── public/         # Static assets
│
├── kitchen-tablet/     # Kitchen management PWA
│   ├── app/
│   ├── components/     # Large touch-friendly UI
│   ├── hooks/          # Realtime subscriptions
│   └── manifest.json   # PWA manifest
│
└── admin-web/          # Restaurant admin
    ├── app/
    ├── components/     # Dashboard components
    └── lib/            # Admin utilities
```

### Shared Packages
```
packages/
├── ui/                 # Shared React components
│   ├── Button/
│   ├── Card/
│   ├── Form/
│   └── index.ts
│
├── api/                # Supabase client wrappers
│   ├── orders.ts
│   ├── menu.ts
│   └── auth.ts
│
├── types/              # TypeScript definitions
│   ├── database.types.ts  # Auto-generated from Supabase
│   └── custom.types.ts
│
└── utils/              # Shared utilities
    ├── formatters.ts
    ├── validators.ts
    └── constants.ts
```

## 🔄 State Management

### Server State
- **TanStack Query (React Query)** for server state
- Automatic caching and invalidation
- Optimistic updates for better UX
- Background refetching

### Client State
- **Zustand** for global UI state
- Shopping cart management
- User preferences
- Modal/drawer states

### Real-time State
- **Supabase Realtime** subscriptions
- Auto-sync order updates
- Live kitchen queue
- Chat messages

## 📊 Database Schema Overview

### Core Tables (MVP)
1. **organizations** - Restaurant tenants
2. **users** - Authentication & roles
3. **categories** - Menu categories
4. **menu_items** - Products with pricing
5. **item_modifiers** - Customizations
6. **orders** - Order headers
7. **order_items** - Order line items
8. **printers** - Thermal printer configs
9. **delivery_zones** - Geofencing polygons
10. **conversations** + **messages** - In-app chat

### Future Expansion (60+ tables)
- Inventory management
- Employee scheduling
- Table management
- Loyalty programs
- Detailed analytics
- Multi-location support

See [Database Schema](./database-schema.md) for complete details.

## 🚀 Deployment Architecture

### Hosting
- **Vercel** - All Next.js apps (FREE tier)
- **Supabase** - Database + backend (FREE tier for testing)
- **CDN** - Automatic via Vercel Edge Network

### CI/CD Pipeline
```
GitHub Push → Vercel Auto-Deploy → Preview URL
     ↓
Production Branch → Production Deploy → Custom Domain
```

### Environments
- **Development** - Local Supabase + localhost
- **Staging** - Supabase staging project + Vercel preview
- **Production** - Supabase prod + Vercel production domain

## 📈 Scalability

### Current Capacity (FREE tier)
- **500MB database** (supports ~100 restaurants)
- **2GB bandwidth/month** (10,000+ orders)
- **50,000 realtime messages/month**

### Scaling Strategy
1. **0-100 restaurants:** FREE tier sufficient
2. **100-500 restaurants:** Supabase Pro ($25/mo) = 8GB database
3. **500+ restaurants:** Add read replicas, connection pooling
4. **High traffic:** Upgrade Vercel for more bandwidth

### Performance Optimization
- **Database indexing** on frequently queried columns
- **Connection pooling** via Supabase
- **CDN caching** for static assets
- **Image optimization** via Next.js Image component
- **Address geocoding cache** to reduce Maps API calls

## 🔗 Integration Points

### Payment Processing
- **Stripe Checkout** for customer payments
- **Stripe Connect** for restaurant payouts (future)
- **Webhook handlers** for payment confirmations

### Communication
- **O365 SMTP** for transactional emails (order confirmations)
- **Twilio WhatsApp** for notifications ($0.0042/msg)
- **Supabase Realtime** for in-app chat (FREE)

### Maps & Geofencing
- **Google Maps JavaScript API** for address input
- **Geocoding API** to get lat/lng coordinates
- **PostGIS ST_Contains** for delivery zone validation
- **Haversine formula** for distance calculations

### Printing
- **Network thermal printers** via ESC/POS protocol
- **Optional Node.js print server** for local printing
- **Browser printing** as fallback
- **Dual ticket generation:** Kitchen (no prices) + Customer (full receipt)

## 🛠️ Technology Decisions

### Why Next.js 14?
- **App Router** for better performance
- **Server Components** reduce bundle size
- **Built-in API routes** for webhooks
- **PWA support** for kitchen tablets
- **SEO-friendly** for customer site

### Why Supabase?
- **PostgreSQL** - proven, reliable database
- **Real-time built-in** - no separate WebSocket server
- **RLS security** - database-level multi-tenancy
- **Auth included** - no separate auth service
- **Free tier** - perfect for testing

### Why Vercel?
- **Zero-config deployment** - push to deploy
- **Free for non-commercial** - perfect for testing
- **Edge network** - fast global delivery
- **Preview deployments** - test before production

## 📝 Design Principles

1. **Mobile-first** - Works on any device (phone to desktop)
2. **Real-time** - Live updates without refresh
3. **Offline-capable** - PWA works with poor connectivity
4. **Multi-tenant** - Secure organization isolation
5. **Cost-effective** - Minimize operational expenses
6. **Developer-friendly** - TypeScript, modern tools
7. **Accessible** - WCAG 2.1 AA compliance

## 🔮 Future Architecture

### Planned Enhancements
- **Microservices** - Split into domain services (orders, inventory, etc.)
- **Event-driven** - Use message queue (RabbitMQ/SQS)
- **Multi-region** - Deploy to multiple regions for low latency
- **Mobile apps** - Native iOS/Android for better performance
- **Advanced analytics** - Dedicated analytics database (ClickHouse)
- **AI features** - Demand forecasting, menu optimization

---

**Last Updated:** November 18, 2025  
**Version:** 0.1.0  
**Status:** Initial Development
