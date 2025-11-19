# QSR Ordering Platform

[![GitHub](https://img.shields.io/badge/github-nishgoswami%2Fqsr--ordering--platform-blue?logo=github)](https://github.com/nishgoswami/qsr-ordering-platform)
[![Project Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/users/nishgoswami/projects/2)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Progress](https://img.shields.io/badge/progress-0%25-red)](http://localhost:3003)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)](https://www.typescriptlang.org/)

> A comprehensive restaurant ordering and management platform supporting QSR (Quick Service Restaurant) and casual dining operations.

## 🚀 Project Overview

Multi-tenant SaaS platform that combines:
- **Customer Ordering** - Web-based ordering with real-time updates
- **Kitchen Management** - Tablet/phone app for order fulfillment
- **Admin Dashboard** - Complete restaurant management
- **Delivery System** - Geofencing, zone-based pricing
- **Thermal Printing** - Dual printer support (kitchen + customer)
- **Multi-Channel Communication** - O365 email, WhatsApp, in-app chat

**Target Market:** Competing with GloriaFood, Toast POS, Square - offering more flexibility at lower cost.

**Device Support:** Works on ANY device (phones, tablets, desktops) via Progressive Web App.

## 📋 Tech Stack

- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL, Realtime, Auth, Storage)
- **Hosting:** Vercel (Free tier)
- **Payments:** Stripe
- **Communications:** O365/SendGrid, Twilio WhatsApp, Supabase Realtime
- **Maps:** Google Maps API with caching
- **Printing:** ESC/POS thermal printers

## 📁 Project Structure

```
qsr-ordering-platform/
├── apps/
│   ├── customer-web/          # Customer ordering site
│   ├── kitchen-tablet/        # Kitchen order management PWA
│   ├── admin-web/             # Restaurant admin dashboard
│   └── print-server/          # Optional thermal printer service
├── packages/
│   ├── ui/                    # Shared React components
│   ├── api/                   # Supabase client wrappers
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Shared utilities
├── supabase/
│   ├── migrations/            # Database migrations
│   ├── functions/             # Edge functions
│   └── config.toml            # Supabase config
├── docs/
│   ├── technical/             # Architecture & API docs
│   ├── user-manual/           # End-user guides
│   ├── api/                   # API documentation
│   └── diagrams/              # System diagrams
├── tools/
│   └── project-tracker/       # Real-time project status site
└── scripts/                   # Build & deployment scripts
```

## 🎯 Three Order Models

1. **Realtime** - Immediate fulfillment (QSR/Fast Food)
2. **Advanced** - Scheduled orders only (Catering)
3. **Hybrid** - Both immediate + scheduled (Flexible restaurants)

## 💰 Budget Allocation

**Test Environment:** $37/month
- Infrastructure: $1/month (FREE tiers)
- O365 Email: $6/month
- WhatsApp API: $20/month
- Google Maps: $10/month

## 🚦 Project Status

**Live Tracker:** [http://localhost:3003](http://localhost:3003) (Run `npm run dev:tracker`)  
**GitHub Projects:** [Project Board](https://github.com/users/nishgoswami/projects/2)  
**Current Phase:** Initial Development Setup

### Quick Stats
- ✅ Completed: 5 tasks
- 🟡 In Progress: 2 tasks  
- 📋 Pending: 8 tasks
- 📊 Overall Progress: 0% (MVP not yet released)

## 📚 Documentation

- [Technical Documentation](./docs/technical/README.md)
- [User Manual](./docs/user-manual/README.md)
- [API Documentation](./docs/api/README.md)
- [Database Schema](./docs/technical/database-schema.md)

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- Git
- Supabase CLI
- npm or pnpm

### Setup
```bash
# Clone repository
git clone <repo-url>
cd qsr-ordering-platform

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development servers
npm run dev
```

### Access Apps
- Customer Site: http://localhost:3000
- Kitchen App: http://localhost:3001
- Admin Dashboard: http://localhost:3002
- Project Tracker: http://localhost:3003

## 🔐 Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `GOOGLE_MAPS_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `SMTP_HOST` (O365 or SendGrid)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

[Choose License - MIT recommended]

## 🔗 Links

- [Live Project Tracker](http://localhost:3003)
- [Documentation Site](./docs/README.md)
- [GitHub Issues](./issues)
- [Changelog](./CHANGELOG.md)
