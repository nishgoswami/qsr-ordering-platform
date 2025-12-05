# 🚀 Deployment Framework Documentation

## Quick Start

### Deploy Single App
```bash
./scripts/deploy.sh admin-web production
```

### Deploy All Apps
```bash
./scripts/deploy-all.sh
```

## 📍 Your Permanent URLs

**Bookmark these - they never change:**

- **Admin Portal**: https://admin-web.vercel.app
- **Restaurant Website**: https://restaurant-website.vercel.app  
- **Customer App**: https://customer-web.vercel.app
- **Kitchen Tablet**: https://kitchen-tablet.vercel.app

## 🎯 Workflow

1. **Make code changes locally**
2. **Test**: `cd apps/[app-name] && npm run dev`
3. **Deploy**: `./scripts/deploy.sh [app-name] production`
4. **Verify**: Visit the permanent URL above

## 🔧 Commands Reference

```bash
# Single app deployment
./scripts/deploy.sh admin-web production
./scripts/deploy.sh restaurant-website production
./scripts/deploy.sh customer-web production
./scripts/deploy.sh kitchen-tablet production

# Deploy everything at once
./scripts/deploy-all.sh

# Check deployment status
cd apps/[app-name]
vercel ls --prod

# Force fresh deployment
cd apps/[app-name]
rm -rf .next
vercel --prod --yes
```

## ✅ Why This Framework?

### Before:
- ❌ Random URLs every deployment
- ❌ Hard to track which URL is current
- ❌ Inconsistent deployment process
- ❌ Manual steps prone to errors

### After:
- ✅ Consistent permanent URLs
- ✅ One-command deployment
- ✅ Automated build process
- ✅ Clear documentation

## 🐛 Troubleshooting

**Q: URL changed after deployment?**  
A: Always use the permanent URL (e.g., `admin-web.vercel.app`), not the random deployment URLs

**Q: Old code showing on website?**  
A: Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Q: Deployment script permission denied?**  
A: Run `chmod +x scripts/*.sh` to make scripts executable

**Q: Environment variables not working?**  
A: Set them in Vercel dashboard: Project Settings → Environment Variables

---

**Created**: December 1, 2025  
**Updated**: After each major change
