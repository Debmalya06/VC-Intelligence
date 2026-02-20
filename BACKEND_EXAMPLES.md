# Backend Implementation Examples

This file contains example code snippets showing how to implement the API endpoints for the VC Intelligence Dashboard backend.

## Table of Contents

1. [Next.js API Routes](#nextjs-api-routes)
2. [Express.js Server](#expressjs-server)
3. [Supabase Setup](#supabase-setup)
4. [Prisma Schema](#prisma-schema)

---

## Next.js API Routes

The simplest approach - implement API routes directly in your Next.js project.

### 1. GET Companies Endpoint

**File: `app/api/companies/route.js`**

```javascript
import { mockCompanies } from '@/lib/mockData';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    const location = searchParams.get('location') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';

    // Filter companies
    let filtered = mockCompanies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        company.description.toLowerCase().includes(search.toLowerCase());
      const matchesIndustry = !industry || company.industry === industry;
      const matchesLocation = !location || company.location === location;
      return matchesSearch && matchesIndustry && matchesLocation;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginatedData = filtered.slice(start, start + limit);

    return Response.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return Response.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
```

### 2. GET Company by ID

**File: `app/api/companies/[id]/route.js`**

```javascript
import { mockCompanies } from '@/lib/mockData';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const company = mockCompanies.find((c) => c.id === parseInt(id));

    if (!company) {
      return Response.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return Response.json({ data: company });
  } catch (error) {
    console.error('Error fetching company:', error);
    return Response.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
```

### 3. Enrichment Endpoint

**File: `app/api/companies/[id]/enrich/route.js`**

```javascript
import { mockCompanies } from '@/lib/mockData';

// This is a simplified example. In production, you'd call a real enrichment service
// like Clearbit, Hunter, or a custom web scraper

async function scrapeAndEnrich(url) {
  // In production, implement actual web scraping and LLM extraction
  // This is just a placeholder that returns mock data
  
  // Example with hypothetical enrichment service:
  // const response = await fetch('https://api.enrichment-service.com/enrich', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.ENRICHMENT_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ url }),
  // });
  
  return {
    summary: 'Mock enrichment summary',
    whatTheyDo: ['Activity 1', 'Activity 2'],
    keywords: ['keyword1', 'keyword2'],
    signals: [
      { label: 'Careers page detected', status: true },
      { label: 'Recent blog post', status: true },
    ],
    sources: [
      { url: url, timestamp: new Date().toISOString() },
    ],
  };
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const company = mockCompanies.find((c) => c.id === parseInt(id));

    if (!company) {
      return Response.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (company.enriched) {
      return Response.json(
        { error: 'Company already enriched', enrichedAt: new Date() },
        { status: 400 }
      );
    }

    // Get enrichment data
    const enrichment = await scrapeAndEnrich(company.website);

    // In production, save to database
    // await db.enrichments.create({
    //   companyId: id,
    //   ...enrichment,
    // });

    return Response.json(
      {
        enrichmentId: `enrich_${Date.now()}`,
        companyId: parseInt(id),
        status: 'completed',
        data: enrichment,
        completedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error enriching company:', error);
    return Response.json(
      { error: 'Failed to enrich company' },
      { status: 500 }
    );
  }
}
```

### 4. Lists Endpoints

**File: `app/api/lists/route.js`**

```javascript
// GET all lists for user
export async function GET(request) {
  try {
    // In production, get user from JWT token
    const userId = 'user_123';

    // In production, fetch from database
    // const lists = await db.lists.findMany({
    //   where: { userId },
    // });

    const mockLists = [
      { id: 1, name: 'Series A Targets', companyCount: 3 },
      { id: 2, name: 'Fintech Watch', companyCount: 2 },
    ];

    return Response.json({ data: mockLists });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    );
  }
}

// POST create new list
export async function POST(request) {
  try {
    const userId = 'user_123';
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return Response.json(
        { error: 'List name required' },
        { status: 400 }
      );
    }

    // In production, save to database
    // const newList = await db.lists.create({
    //   data: {
    //     userId,
    //     name,
    //     description,
    //   },
    // });

    const newList = {
      id: Date.now(),
      name,
      description,
      companies: [],
    };

    return Response.json({ data: newList }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to create list' },
      { status: 500 }
    );
  }
}
```

### 5. Middleware for Authentication

**File: `middleware.js`**

```javascript
import { NextResponse } from 'next/server';

const protectedRoutes = [
  '/api/lists',
  '/api/searches',
  '/api/companies/*/enrich',
];

export function middleware(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  // Check if route needs authentication
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.includes(route)
  );

  if (isProtected && !token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // In production, verify JWT token
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   request.user = decoded;
  // } catch (error) {
  //   return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  // }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## Express.js Server

If you prefer a separate Node.js backend, here's how to structure it:

### Setup

```bash
npm init -y
npm install express cors dotenv pg prisma
npm install -D nodemon
```

### 1. Express Server Setup

**File: `server.js`**

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/companies', async (req, res) => {
  try {
    const { search, industry, location, page = 1, limit = 10 } = req.query;

    let where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (industry) where.industry = industry;
    if (location) where.location = location;

    const companies = await prisma.company.findMany({
      where,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    const total = await prisma.company.count({ where });

    res.json({
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { enrichment: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ data: company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies/:id/enrich', async (req, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (company.enriched) {
      return res.status(400).json({ error: 'Already enriched' });
    }

    // Call enrichment service
    const enrichmentData = await enrichCompany(company.website);

    // Save enrichment
    const enrichment = await prisma.enrichment.create({
      data: {
        companyId: parseInt(id),
        summary: enrichmentData.summary,
        whatTheyDo: enrichmentData.whatTheyDo,
        keywords: enrichmentData.keywords,
        signals: enrichmentData.signals,
        sources: enrichmentData.sources,
        enrichedAt: new Date(),
      },
    });

    // Mark company as enriched
    await prisma.company.update({
      where: { id: parseInt(id) },
      data: { enriched: true, enrichedAt: new Date() },
    });

    res.json({
      enrichmentId: `enrich_${Date.now()}`,
      companyId: parseInt(id),
      status: 'completed',
      data: enrichmentData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Enrichment Service

**File: `services/enrichment.js`**

```javascript
async function enrichCompany(url) {
  // Example using a hypothetical enrichment API
  try {
    const response = await fetch('https://api.enrichment-service.com/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ENRICHMENT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Enrichment API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      summary: data.summary,
      whatTheyDo: data.activities || [],
      keywords: data.tags || [],
      signals: parseSignals(data),
      sources: [{ url, timestamp: new Date().toISOString() }],
    };
  } catch (error) {
    console.error('Enrichment error:', error);
    throw error;
  }
}

function parseSignals(enrichmentData) {
  return [
    {
      label: 'Careers page detected',
      status: enrichmentData.hasCareersPage || false,
    },
    {
      label: 'Blog found',
      status: enrichmentData.hasBlog || false,
    },
    {
      label: 'Recent updates',
      status: enrichmentData.hasRecentUpdates || false,
    },
    {
      label: 'Hiring activity',
      status: enrichmentData.isHiring || false,
    },
  ];
}

export { enrichCompany };
```

---

## Supabase Setup

### SQL Schema

```sql
-- Create companies table
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

-- Create enrichments table
CREATE TABLE enrichments (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  summary TEXT,
  what_they_do JSONB,
  keywords JSONB,
  signals JSONB,
  sources JSONB,
  enriched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_location ON companies(location);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_enriched ON companies(enriched);

-- Enable RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichments ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Public read enrichments"
  ON enrichments FOR SELECT
  USING (true);
```

### Supabase Client

**File: `lib/supabase.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getCompanies(filters = {}) {
  let query = supabase.from('companies').select('*');

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters.industry) {
    query = query.eq('industry', filters.industry);
  }
  if (filters.location) {
    query = query.eq('location', filters.location);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function enrichCompany(id, enrichmentData) {
  const { data, error } = await supabase
    .from('enrichments')
    .insert({
      company_id: id,
      ...enrichmentData,
      enriched_at: new Date(),
    });

  if (error) throw error;

  // Update company enriched status
  await supabase
    .from('companies')
    .update({
      enriched: true,
      enriched_at: new Date(),
    })
    .eq('id', id);

  return data;
}

export default supabase;
```

---

## Prisma Schema

**File: `prisma/schema.prisma`**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Company {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  industry    String?
  location    String?
  website     String?
  founded     Int?
  employees   Int?
  signals     Int       @default(0)
  enriched    Boolean   @default(false)
  enrichedAt  DateTime?

  enrichment  Enrichment?
  lists       ListItem[]
  notes       Note[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Enrichment {
  id          Int       @id @default(autoincrement())
  company     Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId   Int       @unique
  summary     String?
  whatTheyDo  Json?
  keywords    Json?
  signals     Json?
  sources     Json?
  enrichedAt  DateTime?

  createdAt   DateTime  @default(now())

  @@index([companyId])
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
  id        Int     @id @default(autoincrement())
  list      List    @relation(fields: [listId], references: [id], onDelete: Cascade)
  listId    Int
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId Int
  addedAt   DateTime @default(now())

  @@unique([listId, companyId])
  @@index([listId])
  @@index([companyId])
}

model SavedSearch {
  id      Int     @id @default(autoincrement())
  userId  String
  query   String
  filters Json?
  savedAt DateTime @default(now())

  @@index([userId])
}

model Note {
  id        Int     @id @default(autoincrement())
  userId    String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId Int
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, companyId])
  @@index([userId])
  @@index([companyId])
}
```

---

## Environment Variables

**.env.local**

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vc_intelligence

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_SECRET_KEY=your-secret-key

# JWT
JWT_SECRET=your-jwt-secret

# Enrichment Service
ENRICHMENT_API_KEY=your-enrichment-api-key
ENRICHMENT_SERVICE_URL=https://api.enrichment-service.com
```

---

## Getting Started with Backend

### Step 1: Choose Your Stack
- **Easiest**: Next.js API routes + Supabase
- **Most Scalable**: Express.js + PostgreSQL
- **Hybrid**: Next.js routes + separate Node.js service

### Step 2: Set Up Database
- Create PostgreSQL or use Supabase
- Run schema migrations
- Set up indexes and RLS

### Step 3: Implement Core Endpoints
1. GET /api/companies
2. GET /api/companies/:id
3. POST /api/companies/:id/enrich
4. CRUD endpoints for lists

### Step 4: Connect Frontend
- Update API calls in frontend
- Remove mock data
- Migrate localStorage to database

### Step 5: Add Real Enrichment
- Integrate with Clearbit, Hunter, or custom scraper
- Implement background jobs
- Add webhook notifications

---

## Testing Your API

```bash
# Test GET companies
curl http://localhost:3000/api/companies

# Test GET single company
curl http://localhost:3000/api/companies/1

# Test enrichment
curl -X POST http://localhost:3000/api/companies/1/enrich \
  -H "Content-Type: application/json"
```

---

## Production Checklist

- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Set up CORS properly
- [ ] Add comprehensive error handling
- [ ] Implement logging
- [ ] Add monitoring/alerts
- [ ] Optimize database queries
- [ ] Set up backups
- [ ] Configure environment variables
- [ ] Test all endpoints
- [ ] Set up CI/CD pipeline
- [ ] Document API
- [ ] Security audit
- [ ] Load testing

---

Refer to the main `API_SPECIFICATION.md` for complete endpoint documentation.
