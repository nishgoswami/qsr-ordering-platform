# Production Deployment Guide

## Quick Start - Clean Deployment

### Step 1: Clean Database
Go to Supabase SQL Editor and run `deploy-db-reset.sql`

### Step 2: Deploy Application
```bash
cd apps/admin-web
npm run build
vercel --prod --yes
```

### Step 3: Create Admin User
Visit deployed URL `/signup` and complete the form

### Step 4: Approve Admin
Run `deploy-approve-admin.sql` in Supabase (update email)

### Step 5: Login
Visit `/login` with your credentials

---

## Automated Deployment (Recommended)

```bash
cd "/Users/nishgoswami/Documents/Python Projects/ISO Apps"
chmod +x deploy-production.sh
./deploy-production.sh production
```

The script guides you through each step interactively.

---

## Environment Configuration

### Local Development
```bash
npm run dev
# Uses .env.local
```

### Preview/Staging
```bash
vercel
# Uses preview environment variables
```

### Production
```bash
vercel --prod
# Uses production environment variables
```

---

## Troubleshooting

### Signup fails with "RLS policy violation"
Database reset didn't run properly. Re-run `deploy-db-reset.sql`

### Signup fails with "foreign key constraint"
Foreign key not configured. Run:
```sql
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_user_id_fkey;
ALTER TABLE staff ADD CONSTRAINT staff_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) 
DEFERRABLE INITIALLY DEFERRED;
```

### Cannot login after signup
User not approved. Run `deploy-approve-admin.sql` with your email

---

## Deployment Checklist

- [ ] Database cleaned (all tables empty)
- [ ] RLS disabled on required tables
- [ ] Foreign keys configured correctly
- [ ] Environment variables set in Vercel
- [ ] Application built successfully
- [ ] Deployed to Vercel
- [ ] Admin user created via signup
- [ ] Admin user approved in database
- [ ] Admin login successful
- [ ] No demo/test data present

---

## File Reference

- `deploy-production.sh` - Automated deployment script
- `deploy-db-reset.sql` - Clean database before deployment
- `deploy-approve-admin.sql` - Approve admin user after signup
- This file - Deployment documentation
