# Contributing to QSR Ordering Platform

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Git
- npm or pnpm
- Supabase CLI (optional for local database)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd qsr-ordering-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
qsr-ordering-platform/
├── apps/              # Application workspaces
│   ├── customer-web/  # Customer ordering site
│   ├── kitchen-tablet/# Kitchen management
│   └── admin-web/     # Admin dashboard
├── packages/          # Shared code
│   ├── ui/           # Shared components
│   ├── api/          # API clients
│   ├── types/        # TypeScript types
│   └── utils/        # Utilities
├── docs/             # Documentation
├── tools/            # Development tools
└── supabase/         # Database migrations
```

## 🔧 Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Active development
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/topic` - Documentation updates

### Creating a Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat: add shopping cart persistence
fix: resolve checkout payment error
docs: update API documentation
refactor: simplify order status logic
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --filter=@qsr/ui

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- Place tests next to the code: `Button.tsx` → `Button.test.tsx`
- Use descriptive test names
- Test user interactions, not implementation details
- Aim for >80% code coverage on critical paths

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🎨 Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types for reusability

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract complex logic to custom hooks
- Use descriptive prop names

**Example:**
```typescript
interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (itemId: string) => void;
  isAvailable?: boolean;
}

export function MenuItemCard({ 
  item, 
  onAddToCart, 
  isAvailable = true 
}: MenuItemCardProps) {
  // Component implementation
}
```

### File Organization

- One component per file
- Group related files in folders
- Use index.ts for clean exports

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Button.stories.tsx
│   └── index.ts
```

## 📝 Documentation

### Code Comments

- Comment complex logic
- Use JSDoc for functions and components
- Keep comments up-to-date

**Example:**
```typescript
/**
 * Validates if an address is within delivery zones
 * @param address - Customer address with lat/lng
 * @param zones - Array of delivery zones
 * @returns Matching zone or null if outside all zones
 */
export function validateDeliveryAddress(
  address: Address,
  zones: DeliveryZone[]
): DeliveryZone | null {
  // Implementation
}
```

### Documentation Updates

- Update docs when changing functionality
- Include examples in API documentation
- Add screenshots for UI changes
- Update CHANGELOG.md

## 🔍 Code Review

### Before Submitting PR

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log() statements
- [ ] No commented-out code
- [ ] Commits are well-formatted

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Tested on multiple devices

## Screenshots (if applicable)
[Add screenshots]

## Related Issues
Closes #123
```

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- Device: [e.g. iPhone 12]
- OS: [e.g. iOS 15]
- Browser: [e.g. Safari]
- App version: [e.g. 0.1.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or other context
```

## 🏗️ Architecture Decisions

### When to Create a New Package

Create a new package in `/packages` when:
- Code is shared by 2+ apps
- Functionality is self-contained
- You want independent versioning

### When to Add to Existing App

Add to existing app when:
- Feature is specific to that app
- Unlikely to be reused
- Tightly coupled to app logic

### Database Changes

1. Create migration in `/supabase/migrations`
2. Update TypeScript types
3. Update RLS policies
4. Test locally before deploying
5. Document schema changes

**Example migration:**
```sql
-- supabase/migrations/20251118_add_loyalty_program.sql
CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  points_per_dollar DECIMAL(10, 2) DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org loyalty program"
  ON loyalty_programs FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

## 🚢 Deployment

### Deployment Process

1. **Development → Staging**
   - Automatic on push to `develop`
   - Preview URL generated
   - Run E2E tests

2. **Staging → Production**
   - Create PR from `develop` to `main`
   - Requires 2 approvals
   - All tests must pass
   - Automatic deploy on merge

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Performance tested
- [ ] Security review completed

## 📞 Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Create an Issue
- **Features:** Create an Issue with feature request template
- **Security:** Email security@qsr-platform.com

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing!** 🎉
