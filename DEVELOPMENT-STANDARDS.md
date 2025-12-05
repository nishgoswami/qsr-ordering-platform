# Development Standards & Best Practices

## 🎯 Project Goals

1. **Consistency** - Same patterns across all apps
2. **Maintainability** - Easy to understand and modify
3. **Scalability** - Can grow without major rewrites
4. **Reliability** - Predictable deployments and URLs
5. **Security & Compliance** - Following industry standards (SOC 2, ISO 27001, PCI DSS)
6. **Data Protection** - GDPR, CCPA, and privacy-first design

## 🔒 Security & Compliance Standards

### SOC 2 Type II Compliance Principles

#### 1. Security
- **Access Controls**: Implement role-based access control (RBAC)
- **Authentication**: Multi-factor authentication for admin users
- **Encryption**: TLS 1.3 for data in transit, AES-256 for data at rest
- **Session Management**: Secure session tokens, automatic timeout

```typescript
// ✅ Good: Secure authentication check
export async function requireAuth(request: Request) {
  const session = await getSession(request);
  
  if (!session || !session.user) {
    throw redirect('/login');
  }
  
  // Check session expiry (15 minutes of inactivity)
  if (Date.now() - session.lastActivity > 15 * 60 * 1000) {
    await destroySession(session);
    throw redirect('/login?reason=timeout');
  }
  
  return session.user;
}
```

#### 2. Availability
- **Uptime Monitoring**: 99.9% uptime target
- **Error Tracking**: Log all errors with context
- **Backup & Recovery**: Automated daily backups
- **Disaster Recovery**: Recovery Time Objective (RTO) < 4 hours

#### 3. Processing Integrity
- **Data Validation**: Validate all user inputs
- **Transaction Logging**: Log all state-changing operations
- **Audit Trails**: Track who did what and when
- **Idempotency**: Ensure operations can be safely retried

```typescript
// ✅ Good: Input validation and audit logging
export async function updateRestaurant(id: string, data: RestaurantUpdate, userId: string) {
  // Validate input
  const validated = restaurantSchema.parse(data);
  
  // Audit log
  await createAuditLog({
    entityType: 'restaurant',
    entityId: id,
    action: 'update',
    userId,
    changes: validated,
    timestamp: new Date(),
    ipAddress: request.ip,
  });
  
  // Perform update
  const { data, error } = await supabase
    .from('restaurants')
    .update(validated)
    .eq('id', id)
    .single();
    
  if (error) {
    await logError('restaurant_update_failed', { id, error, userId });
    throw new Error('Update failed');
  }
  
  return data;
}
```

#### 4. Confidentiality
- **Data Classification**: Public, Internal, Confidential, Restricted
- **PII Protection**: Encrypt personally identifiable information
- **Access Logging**: Log all access to sensitive data
- **Data Minimization**: Collect only necessary data

#### 5. Privacy
- **Consent Management**: Explicit user consent for data collection
- **Right to Delete**: Allow users to delete their data
- **Data Portability**: Export user data on request
- **Privacy by Design**: Privacy considerations in all features

### ISO 27001 Information Security Controls

#### Access Control (A.9)
```typescript
// Role-based access control
export enum UserRole {
  SUPER_ADMIN = 'super_admin',    // Full system access
  RESTAURANT_ADMIN = 'admin',     // Restaurant management
  MANAGER = 'manager',            // Limited admin functions
  STAFF = 'staff',                // Order & kitchen access
  CUSTOMER = 'customer',          // Customer-facing only
}

// Permission checking
export function hasPermission(user: User, permission: Permission): boolean {
  const rolePermissions = {
    [UserRole.SUPER_ADMIN]: ['*'],
    [UserRole.RESTAURANT_ADMIN]: ['manage_menu', 'manage_staff', 'view_reports'],
    [UserRole.MANAGER]: ['manage_orders', 'view_reports'],
    [UserRole.STAFF]: ['view_orders', 'update_order_status'],
    [UserRole.CUSTOMER]: ['place_order', 'view_own_orders'],
  };
  
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}
```

#### Cryptography (A.10)
```typescript
// ✅ Good: Encrypt sensitive data
import { encrypt, decrypt } from '@/lib/crypto';

// Store encrypted credit card (PCI DSS compliant)
export async function savePaymentMethod(data: PaymentMethod) {
  const encrypted = {
    ...data,
    cardNumber: encrypt(data.cardNumber),  // Encrypt PAN
    cvv: null,                             // Never store CVV
    expiryDate: encrypt(data.expiryDate),
  };
  
  return await db.insert(encrypted);
}

// ❌ Bad: Plain text sensitive data
export async function savePaymentMethod(data: PaymentMethod) {
  return await db.insert(data); // Storing CVV and card number in plain text
}
```

#### Logging & Monitoring (A.12)
```typescript
// ✅ Good: Comprehensive logging
export async function logSecurityEvent(event: SecurityEvent) {
  await db.securityLogs.insert({
    timestamp: new Date(),
    eventType: event.type,           // login_failed, permission_denied, etc.
    userId: event.userId,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    resource: event.resource,
    action: event.action,
    result: event.result,            // success, failure, blocked
    severity: event.severity,        // info, warning, critical
    metadata: event.metadata,
  });
  
  // Alert on critical events
  if (event.severity === 'critical') {
    await sendSecurityAlert(event);
  }
}
```

### PCI DSS Compliance (Payment Card Industry)

#### Requirement 3: Protect Stored Cardholder Data
```typescript
// ✅ Compliant: Tokenize card data
export async function processPayment(order: Order, card: CardDetails) {
  // Use Stripe/payment processor tokenization
  const token = await stripe.tokens.create({
    card: {
      number: card.number,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvc: card.cvc,
    },
  });
  
  // Store only the token, never raw card data
  await db.orders.update(order.id, {
    paymentToken: token.id,      // Store token
    last4: card.number.slice(-4), // Last 4 digits only
    cardBrand: token.card.brand,
  });
  
  return token;
}

// ❌ Non-compliant: Storing card data
const cardData = {
  number: '4242424242424242',  // Never store full PAN
  cvv: '123',                  // Never store CVV
  pin: '1234',                 // Never store PIN
};
```

#### Requirement 6: Secure Development
```typescript
// ✅ Good: SQL injection prevention
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('restaurant_id', restaurantId)  // Parameterized query
  .eq('status', status);

// ❌ Bad: SQL injection vulnerable
const query = `SELECT * FROM orders WHERE restaurant_id = '${restaurantId}'`;
```

#### Requirement 8: Identify and Authenticate Access
```typescript
// ✅ Good: Strong password policy
export const PASSWORD_POLICY = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventReuse: 5,              // Last 5 passwords
  maxAge: 90,                   // Days
  requireMFA: true,             // For admin users
};

export function validatePassword(password: string): boolean {
  if (password.length < PASSWORD_POLICY.minLength) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*]/.test(password)) return false;
  return true;
}
```

### GDPR Compliance (EU Data Protection)

#### Right to Access (Article 15)
```typescript
// Allow users to export their data
export async function exportUserData(userId: string) {
  const userData = {
    profile: await db.users.findById(userId),
    orders: await db.orders.findByUser(userId),
    addresses: await db.addresses.findByUser(userId),
    paymentMethods: await db.paymentMethods.findByUser(userId, { masked: true }),
    preferences: await db.preferences.findByUser(userId),
    activityLog: await db.activityLogs.findByUser(userId),
  };
  
  // Return in machine-readable format (JSON)
  return JSON.stringify(userData, null, 2);
}
```

#### Right to Erasure (Article 17)
```typescript
// Allow users to delete their data
export async function deleteUserData(userId: string) {
  await db.transaction(async (tx) => {
    // Anonymize orders (keep for business records)
    await tx.orders.update(
      { userId },
      { 
        userId: null,
        customerName: 'Deleted User',
        customerEmail: 'deleted@example.com',
        customerPhone: null,
      }
    );
    
    // Delete PII
    await tx.addresses.delete({ userId });
    await tx.paymentMethods.delete({ userId });
    await tx.preferences.delete({ userId });
    
    // Delete user account
    await tx.users.delete({ id: userId });
    
    // Audit log
    await tx.auditLogs.insert({
      action: 'user_deletion',
      userId,
      timestamp: new Date(),
    });
  });
}
```

#### Privacy by Design
```typescript
// ✅ Good: Minimal data collection
interface CustomerOrder {
  id: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;    // Only what's needed
  phone: string;              // For delivery contact
  // ❌ Don't collect: SSN, birth date, full address history
}

// Data retention policy
export async function cleanupOldData() {
  // Delete personal data after retention period
  const retentionDays = 365 * 7; // 7 years for financial records
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  await db.orders.update(
    { createdAt: { lt: cutoffDate } },
    { 
      customerEmail: null,
      customerPhone: null,
      deliveryAddress: null,
    }
  );
}
```

### OWASP Top 10 Protection

#### 1. Injection Prevention
```typescript
// ✅ Good: Use ORM with parameterization
const orders = await db.orders.findMany({
  where: {
    restaurantId: params.id,
    status: { in: ['pending', 'confirmed'] },
  },
});

// ✅ Good: Input validation
const orderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().min(1).max(99),
  })),
  total: z.number().positive(),
});
```

#### 2. Broken Authentication Prevention
```typescript
// ✅ Good: Secure session management
export async function createSession(user: User) {
  const session = {
    id: generateSecureToken(),
    userId: user.id,
    expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
    createdAt: Date.now(),
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
  };
  
  // Store in secure, HTTP-only cookie
  setCookie('session', session.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60,
  });
  
  return session;
}
```

#### 3. Sensitive Data Exposure Prevention
```typescript
// ✅ Good: Never log sensitive data
export function logOrder(order: Order) {
  logger.info('Order created', {
    orderId: order.id,
    restaurantId: order.restaurantId,
    itemCount: order.items.length,
    total: order.total,
    // ❌ Don't log: customer email, phone, address, payment info
  });
}

// ✅ Good: Mask sensitive data in responses
export function sanitizeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: maskEmail(user.email),  // j***@example.com
    phone: maskPhone(user.phone),  // ***-***-1234
    // Don't include: password, tokens, SSN, payment methods
  };
}
```

#### 4. XML External Entities (XXE) Prevention
```typescript
// ✅ Good: Disable external entity processing
import { parseStringPromise } from 'xml2js';

const parser = parseStringPromise({
  explicitArray: false,
  ignoreAttrs: false,
  xmlns: false,
  // Disable external entities
  strict: true,
});
```

#### 5. Broken Access Control Prevention
```typescript
// ✅ Good: Check ownership before operations
export async function updateOrder(orderId: string, userId: string, updates: OrderUpdate) {
  // Verify user owns this order or is admin
  const order = await db.orders.findById(orderId);
  
  if (order.userId !== userId && !isAdmin(userId)) {
    throw new ForbiddenError('You do not have permission to update this order');
  }
  
  return await db.orders.update(orderId, updates);
}
```

#### 6. Security Misconfiguration Prevention
```typescript
// ✅ Good: Secure headers
export function setSecurityHeaders(response: Response) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
}
```

## 📋 Security Checklist

### Before Every Deployment
- [ ] All secrets stored in environment variables (never in code)
- [ ] Input validation on all user inputs
- [ ] Authentication required for protected routes
- [ ] Authorization checks for all operations
- [ ] SQL injection prevention (use ORM/parameterized queries)
- [ ] XSS prevention (sanitize user content)
- [ ] CSRF tokens on forms
- [ ] Secure headers configured
- [ ] HTTPS enforced
- [ ] Error messages don't leak sensitive info

### Code Review Checklist
- [ ] No hardcoded credentials or API keys
- [ ] No console.log with sensitive data
- [ ] Proper error handling (try-catch blocks)
- [ ] Input validation with schema
- [ ] Authorization checks present
- [ ] Audit logging for sensitive operations
- [ ] Rate limiting on APIs
- [ ] No SQL concatenation
- [ ] Encrypted sensitive data at rest
- [ ] Secure session management

### Compliance Checklist
- [ ] **SOC 2**: Access controls, audit logs, encryption
- [ ] **ISO 27001**: Risk assessment, security policies
- [ ] **PCI DSS**: No card data storage, tokenization
- [ ] **GDPR**: Consent management, data export/deletion
- [ ] **CCPA**: Privacy policy, opt-out mechanism
- [ ] **HIPAA** (if health data): PHI encryption, access logs
- [ ] **WCAG 2.1**: Accessibility standards

## 📁 Project Structure Standard

```
ISO Apps/
├── apps/                   # All applications
│   ├── admin-web/         # Admin dashboard (Next.js)
│   ├── restaurant-website/ # Public site (Next.js)
│   ├── customer-web/      # Customer app (Next.js)
│   └── kitchen-tablet/    # Kitchen display (Next.js)
├── scripts/               # Deployment & automation
│   ├── deploy.sh         # Single app deployment
│   ├── deploy-all.sh     # Deploy all apps
│   └── setup-supabase.sh # Database setup
├── docs/                  # Documentation
├── supabase/             # Database migrations
│   └── migrations/       # SQL migration files
└── DEPLOYMENT.md         # Deployment guide
```

## 🔐 Data Protection & Privacy Standards

### Data Classification Levels

| Level | Examples | Storage | Access | Logging |
|-------|----------|---------|--------|---------|
| **Public** | Menu items, restaurant hours | Unencrypted | No restrictions | Optional |
| **Internal** | Order history, analytics | Encrypted in transit | Authenticated users | Basic |
| **Confidential** | Customer emails, phone numbers | Encrypted at rest + transit | Need-to-know basis | Full audit trail |
| **Restricted** | Payment tokens, passwords | Encrypted + hashed | Admin only | Complete audit trail |

### Personal Data Handling

```typescript
// Personal data that requires special handling
interface PersonalData {
  // PII (Personally Identifiable Information)
  email: string;           // GDPR protected
  phone: string;           // GDPR protected
  fullName: string;        // GDPR protected
  address: Address;        // GDPR protected
  
  // Sensitive data
  paymentToken: string;    // PCI DSS protected
  passwordHash: string;    // Never log or expose
  
  // Business data
  orders: Order[];         // 7-year retention
  preferences: Settings;   // Can be deleted on request
}

// Data retention policy
const RETENTION_POLICY = {
  orders: 7 * 365,          // 7 years (tax law)
  sessions: 30,             // 30 days
  logs: 90,                 // 90 days
  personalData: 0,          // Delete on user request
  auditLogs: 7 * 365,       // 7 years (compliance)
};
```

### Security Incident Response

```typescript
// Incident detection and response
export async function detectSecurityIncident(event: SecurityEvent) {
  const incidents = [
    { pattern: /login_failed.*{5,}/, severity: 'high', type: 'brute_force' },
    { pattern: /sql_injection_attempt/, severity: 'critical', type: 'injection' },
    { pattern: /unauthorized_access.*admin/, severity: 'critical', type: 'privilege_escalation' },
    { pattern: /data_export.*large_volume/, severity: 'high', type: 'data_exfiltration' },
  ];
  
  for (const incident of incidents) {
    if (incident.pattern.test(event.description)) {
      await handleSecurityIncident({
        type: incident.type,
        severity: incident.severity,
        event,
        timestamp: new Date(),
      });
    }
  }
}

// Incident response procedure
export async function handleSecurityIncident(incident: SecurityIncident) {
  // 1. Log incident
  await db.securityIncidents.insert(incident);
  
  // 2. Alert security team
  await sendAlert({
    to: process.env.SECURITY_EMAIL,
    subject: `SECURITY INCIDENT: ${incident.type}`,
    body: JSON.stringify(incident, null, 2),
  });
  
  // 3. Automatic response
  if (incident.severity === 'critical') {
    // Block IP temporarily
    await blockIP(incident.event.ipAddress, { duration: 3600 });
    
    // Revoke sessions if user account compromised
    if (incident.event.userId) {
      await revokeAllSessions(incident.event.userId);
    }
  }
  
  // 4. Create incident report
  await createIncidentReport(incident);
}
```

## 🔧 Code Standards

### File Naming
- **Components**: PascalCase (`AdminLayout.tsx`, `MenuCard.tsx`)
- **Utilities**: camelCase (`database.ts`, `formatters.ts`)
- **Pages**: Next.js convention (`page.tsx`, `layout.tsx`)

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { ComponentName } from '@/components';

// 2. Types/Interfaces
interface Props {
  title: string;
  onSave: () => void;
}

// 3. Component
export default function ComponentName({ title, onSave }: Props) {
  // State
  const [value, setValue] = useState('');
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleClick = () => {};
  
  // Render
  return <div>...</div>;
}
```

### Database Queries
```typescript
// ✅ Good: Error handling, type safety
export async function getRestaurant(): Promise<Restaurant | null> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

// ❌ Bad: No error handling
export async function getRestaurant() {
  const { data } = await supabase.from('restaurants').select('*');
  return data;
}
```

## 🚀 Deployment Standards

### Pre-deployment Checklist
- [ ] Code builds locally: `npm run build`
- [ ] No TypeScript errors
- [ ] Environment variables set
- [ ] Database changes deployed
- [ ] Tested in local environment

### Deployment Process
```bash
# 1. Make changes
git add .
git commit -m "feat: add new feature"

# 2. Deploy
./scripts/deploy.sh [app-name] production

# 3. Verify
# Visit permanent URL and test
```

## 🔐 Environment Variables

### Standard Variables (All Apps)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### App-Specific Variables
```bash
# Admin only
NEXT_PUBLIC_ADMIN_API_KEY=

# Customer app only
NEXT_PUBLIC_STRIPE_KEY=
```

### Setting Variables
```bash
# Local development
cp .env.example .env.local
# Edit .env.local

# Production (Vercel)
vercel env add VARIABLE_NAME production
```

## 📊 Git Workflow

### Branch Naming
- `main` - Production code
- `dev` - Development branch
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `hotfix/critical-fix` - Urgent production fixes

### Commit Messages
```bash
# Format: type(scope): description

feat(admin): add section visibility toggles
fix(restaurant): correct hours display
docs(deployment): update URL documentation
style(menu): improve card spacing
refactor(database): simplify query logic
```

## 🧪 Testing Standards

### Before Each Deployment
1. **Build Test**: `npm run build` - Must succeed
2. **Local Test**: `npm run dev` - Verify functionality
3. **Browser Test**: Test in Chrome, Safari, Firefox
4. **Mobile Test**: Test responsive design

### Critical Paths to Test
- Login/Logout flow
- Data loading and display
- Form submissions
- Navigation between pages
- Error states

## 📝 Documentation Standards

### Code Comments
```typescript
// ✅ Good: Explains WHY
// Using business_hours instead of hours because database field was renamed
const hours = location.business_hours;

// ❌ Bad: Explains WHAT (obvious from code)
// Get the hours
const hours = location.business_hours;
```

### Function Documentation
```typescript
/**
 * Formats location hours for display
 * @param day - Day of week (lowercase, e.g., "monday")
 * @param location - Location object with business_hours
 * @returns Formatted time string (e.g., "9:00 AM - 5:00 PM")
 */
export function formatHours(day: string, location: Location): string {
  // Implementation
}
```

## 🎨 UI/UX Standards

### Consistency Rules
- **Colors**: Use Tailwind theme colors (orange-600, gray-900, etc.)
- **Spacing**: Use Tailwind spacing (p-4, mb-6, gap-8)
- **Typography**: Use Tailwind text utilities (text-xl, font-bold)
- **Icons**: Use lucide-react icons consistently

### Responsive Design
```tsx
// Always mobile-first
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

### Loading States
```tsx
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}

return <Content data={data} />;
```

## 🔄 Update Process

### Adding New Features
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Deploy to preview: `./scripts/deploy.sh app-name preview`
5. Review and test preview URL
6. Deploy to production: `./scripts/deploy.sh app-name production`
7. Merge to main branch

### Hotfixes
1. Create hotfix branch from main
2. Make minimal required changes
3. Test quickly
4. Deploy immediately
5. Document the issue and fix

## 📚 Resources

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Security & Compliance Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [SOC 2 Compliance Guide](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report)
- [ISO 27001 Standards](https://www.iso.org/isoiec-27001-information-security.html)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/document_library)
- [GDPR Guidelines](https://gdpr.eu/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Security Tools
- **Static Analysis**: ESLint security plugins, Semgrep
- **Dependency Scanning**: npm audit, Snyk, Dependabot
- **Secret Scanning**: GitGuardian, TruffleHog
- **Penetration Testing**: OWASP ZAP, Burp Suite
- **Monitoring**: Sentry, Datadog, CloudWatch

### Internal Documentation
- `DEPLOYMENT.md` - Deployment guide
- `README.md` - Project overview
- `SUPABASE_COMPLETE.md` - Database setup
- `SECURITY.md` - Security policies and procedures
- `COMPLIANCE.md` - Compliance documentation

## 🎓 Training & Certification

### Recommended Training
- OWASP Top 10 training (annual)
- Secure coding practices workshop
- GDPR compliance training
- PCI DSS awareness training
- Incident response drills (quarterly)

### Security Champions Program
- Designate security champions in each team
- Monthly security reviews
- Share security updates and threats
- Conduct code security audits

## 📊 Metrics & Monitoring

### Security Metrics to Track
- Failed login attempts per hour
- API rate limit violations
- 4xx/5xx error rates
- Authentication failures
- Permission denied attempts
- Suspicious activity patterns
- Data export requests
- Session timeouts
- Password reset requests

### Compliance Metrics
- Audit log completeness (100% target)
- Encryption coverage (100% sensitive data)
- Access review completion (quarterly)
- Incident response time (< 1 hour for critical)
- Vulnerability patch time (< 7 days for critical)
- Backup success rate (100% target)
- Uptime percentage (99.9% target)

### Monitoring Alerts
```typescript
// Critical alerts (immediate notification)
- Multiple failed logins from same IP (5+ in 5 min)
- Admin privilege escalation attempt
- Database connection failures
- Payment processing errors
- Data breach indicators
- System downtime

// Warning alerts (hourly digest)
- High error rates (> 1%)
- Slow API responses (> 2s)
- High memory usage (> 80%)
- Failed backup jobs
- Certificate expiration (< 30 days)
```

## 🔄 Continuous Improvement

### Security Review Schedule
- **Daily**: Monitor security logs and alerts
- **Weekly**: Review failed authentications and errors
- **Monthly**: Dependency vulnerability scan
- **Quarterly**: Access control review, penetration testing
- **Annually**: Full security audit, compliance assessment

### Incident Post-Mortem
After any security incident:
1. Document what happened (timeline)
2. Identify root cause
3. List immediate actions taken
4. Create prevention plan
5. Update security procedures
6. Share lessons learned with team
7. Update documentation

---

**Version**: 2.0 (Security Enhanced)  
**Last Updated**: December 1, 2025  
**Review**: Quarterly or after major changes  
**Compliance**: SOC 2, ISO 27001, PCI DSS, GDPR, CCPA  
**Security Contact**: security@yourcompany.com
