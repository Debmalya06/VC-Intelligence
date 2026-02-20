# Deployment Guide

## Quick Start - Vercel (Recommended)

The easiest way to deploy the VC Intelligence Dashboard is to Vercel:

### 1. Connect GitHub Repository

```bash
# Push your code to GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

Visit https://vercel.com and:
1. Click "New Project"
2. Import your GitHub repository
3. Framework: Next.js (auto-detected)
4. Click "Deploy"

Your app will be live in ~1 minute!

### 3. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records at your domain provider

---

## Local Development

### System Requirements

- Node.js 18+ (LTS recommended)
- npm, pnpm, or yarn
- Git

### Setup

```bash
# Clone repository
git clone <repo-url>
cd vc-intelligence

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000 in browser
```

### Environment Variables

Currently, the app requires no environment variables. When you add backend:

```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_SECRET_KEY=your-secret-key
```

---

## Production Deployment

### Building for Production

```bash
# Build optimized production bundle
pnpm build

# Start production server
pnpm start

# Server runs on http://localhost:3000
```

### Deployment Checklist

- [ ] Update `metadata` in `app/layout.jsx`
- [ ] Add proper error boundary components
- [ ] Set up analytics (Google Analytics, Vercel Web Analytics)
- [ ] Configure security headers
- [ ] Add rate limiting for API endpoints (future)
- [ ] Set up database backups (when adding backend)
- [ ] Configure monitoring and logging

### Performance Optimization

```javascript
// next.config.mjs (already configured)
export default {
  compress: true,
  swcMinify: true,
  optimizeFonts: true,
  images: {
    remotePatterns: [
      // Add external image domains here when needed
    ],
  },
};
```

---

## Database Setup (When Adding Backend)

### Option 1: Supabase (Recommended for MVP)

1. Create account at https://supabase.com
2. Create new project
3. Get connection string
4. Create tables:

```sql
-- Companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  location VARCHAR(100),
  website VARCHAR(255),
  founded INT,
  employees INT,
  signals INT DEFAULT 0,
  enriched BOOLEAN DEFAULT FALSE,
  enriched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrichment cache
CREATE TABLE enrichments (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  summary TEXT,
  what_they_do JSONB,
  keywords JSONB,
  signals JSONB,
  sources JSONB,
  enriched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User lists
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- List items (companies in lists)
CREATE TABLE list_items (
  id SERIAL PRIMARY KEY,
  list_id INT REFERENCES lists(id) ON DELETE CASCADE,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(list_id, company_id)
);

-- Saved searches
CREATE TABLE saved_searches (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query VARCHAR(255),
  filters JSONB,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, company_id)
);
```

5. Enable Row-Level Security:

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Public read access to companies
CREATE POLICY "Authenticated users can read companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

-- Users can only access their own data
CREATE POLICY "Users can read their own lists"
  ON lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

6. Add to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

7. Install Supabase client:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### Option 2: PostgreSQL + Prisma

1. Set up PostgreSQL database
2. Install dependencies:

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

3. Initialize Prisma:

```bash
npx prisma init
```

4. Create schema in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Company {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  industry    String?
  location    String?
  website     String?
  founded     Int?
  employees   Int?
  signals     Int      @default(0)
  enriched    Boolean  @default(false)
  enrichedAt  DateTime?
  
  enrichment  Enrichment?
  inLists     ListItem[]
  notes       Note[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Enrichment {
  id          Int      @id @default(autoincrement())
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId   Int      @unique
  summary     String?
  whatTheyDo  Json?
  keywords    Json?
  signals     Json?
  sources     Json?
  enrichedAt  DateTime?
  createdAt   DateTime @default(now())
}

model List {
  id          Int       @id @default(autoincrement())
  userId      String
  name        String
  description String?
  items       ListItem[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model ListItem {
  id        Int      @id @default(autoincrement())
  list      List     @relation(fields: [listId], references: [id], onDelete: Cascade)
  listId    Int
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId Int
  addedAt   DateTime @default(now())
  
  @@unique([listId, companyId])
}

model SavedSearch {
  id        Int      @id @default(autoincrement())
  userId    String
  query     String
  filters   Json?
  savedAt   DateTime @default(now())
}

model Note {
  id        Int      @id @default(autoincrement())
  userId    String
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId Int
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, companyId])
}
```

5. Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Environment Variables Reference

### Frontend (Public - `NEXT_PUBLIC_*`)

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-here
NEXT_PUBLIC_ANALYTICS_ID=google-analytics-id
```

### Backend (Private - only .env.local)

```
DATABASE_URL=postgresql://user:password@localhost:5432/vc_intelligence
SUPABASE_SERVICE_ROLE_KEY=service-key-here
API_SECRET_KEY=random-secret-key
JWT_SECRET=another-secret-key
ENRICHMENT_API_KEY=api-key-for-enrichment-service
```

---

## CI/CD Setup

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
      
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Setup Secrets

In GitHub repository settings, add:
- `VERCEL_TOKEN` - from Vercel account settings
- `VERCEL_ORG_ID` - from Vercel team settings
- `VERCEL_PROJECT_ID` - from Vercel project settings

---

## Monitoring & Analytics

### Vercel Analytics

Already integrated via `@vercel/analytics`. View at https://vercel.com/dashboard

### Application Monitoring

1. **Error Tracking**: Add Sentry

```bash
pnpm add @sentry/nextjs
```

2. **Performance Monitoring**: 

```javascript
// app/layout.jsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Database Monitoring

- Supabase: Built-in dashboard at https://app.supabase.com
- PostgreSQL: Use pg_stat_statements extension

---

## Scaling

### Horizontal Scaling

The app is stateless (localStorage → future database). Easy to scale:

1. Deploy multiple instances to Vercel (automatic)
2. Use CDN for static assets (automatic with Vercel)
3. Database replicas for read-heavy workloads

### Performance Optimizations

- Enable image optimization
- Implement ISR (Incremental Static Regeneration)
- Add caching headers for companies list
- Implement pagination
- Consider adding search indexing (Elasticsearch, Meilisearch)

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_location ON companies(location);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_notes_user_company ON notes(user_id, company_id);
```

---

## Security

### Security Checklist

- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set secure headers in `next.config.mjs`
- [ ] Enable CSRF protection
- [ ] Validate all user inputs
- [ ] Sanitize database queries (use ORM)
- [ ] Implement rate limiting on API
- [ ] Add authentication (JWT or sessions)
- [ ] Use environment variables for secrets
- [ ] Enable RLS on database (Supabase)
- [ ] Rotate API keys regularly

### Security Headers

```javascript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

---

## Troubleshooting

### Build Fails

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
pnpm install

# Try build again
pnpm build
```

### Slow Performance

1. Check Vercel Analytics
2. Profile with Chrome DevTools
3. Check database query performance
4. Implement caching

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql postgresql://user:password@host:5432/database

# Or Supabase connection
npm install -g psql
psql 'postgresql://postgres.project.supabase.co:5432/postgres'
```

---

## Rollback Procedure

### Vercel Rollback

1. Go to Deployments in Vercel
2. Click the previous successful deployment
3. Click the three dots → Promote to Production

### Database Rollback

```bash
# With Supabase
# Use built-in PITR (Point-in-Time Recovery) feature

# With Prisma
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate deploy
```

---

## Cost Estimation

### Vercel (Recommended)

- **Free Tier**: Perfect for development, low traffic
- **Pro**: $20/month (includes $100 credits)
- Bandwidth: $0.50 per GB (after allowance)

### Database

- **Supabase Free**: 500MB storage, 2GB bandwidth
- **Supabase Pro**: $25/month
- **PostgreSQL RDS**: $50-200+/month depending on instance

### Total Monthly Cost

- **Development**: $0 (free tiers)
- **Small Production**: $45/month ($20 Vercel + $25 Supabase)
- **Scaled Production**: $200+/month

---

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Open a GitHub issue
