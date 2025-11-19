# Project Status Tracker

Real-time visualization of development progress for the QSR Ordering Platform.

## 🚀 Features

- **Live Status Updates** - See what's in production, development, and planning
- **Visual Progress** - Color-coded feature status
- **Detailed Info** - Click features for technical details
- **Architecture Diagrams** - Visual system overview
- **Timeline View** - Development roadmap

## 🎯 Status Indicators

- 🟢 **Production** - Live and deployed
- 🟡 **Development** - Currently being built
- 🔵 **Planning** - Designed, awaiting development
- ⚪ **Backlog** - Future consideration

## 🛠️ Tech Stack

- Next.js 14
- TailwindCSS
- TypeScript
- Lucide Icons

## 🏃 Running Locally

```bash
cd tools/project-tracker
npm install
npm run dev
```

Visit http://localhost:3003

## 📊 Data Source

Project status is defined in `data/features.ts` and updated automatically as development progresses.

## 🔄 Auto-Updates

This tracker updates in real-time by monitoring:
- Git commits
- CI/CD deployments
- Feature flags
- Manual status updates

---

**Access:** http://localhost:3003  
**Deploy:** Vercel (automatically deployed with main project)
