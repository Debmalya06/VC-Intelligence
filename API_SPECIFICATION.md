# VC Intelligence API Specification

This document outlines the planned API endpoints for the backend integration of the VC Intelligence Dashboard. These endpoints are not yet implemented but are designed to guide future development.

## Overview

The API will support:
- Company data management
- Enrichment operations
- List management
- Search persistence
- User authentication

## Authentication

All endpoints (except `/health`) require JWT token in `Authorization: Bearer {token}` header.

## Base URL

```
Production: https://api.vcintelligence.com/v1
Development: http://localhost:3000/api
```

---

## Endpoints

### Companies

#### List Companies
```
GET /companies
Query Parameters:
  - search: string (optional) - Search by name or description
  - industry: string (optional) - Filter by industry
  - location: string (optional) - Filter by location
  - page: number (optional, default: 1) - Page number
  - limit: number (optional, default: 10) - Items per page
  - sort: string (optional) - Sort field (name, founded, signals)
  - order: string (optional) - asc or desc

Response (200 OK):
{
  "data": [
    {
      "id": 1,
      "name": "PayFlow",
      "description": "Modern payment infrastructure",
      "industry": "Fintech",
      "location": "SF",
      "website": "https://payflow.example.com",
      "founded": 2020,
      "employees": 45,
      "signals": 5,
      "enriched": true,
      "enrichedAt": "2026-02-18T10:42:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 142,
    "totalPages": 15
  }
}
```

#### Get Company Details
```
GET /companies/:id

Response (200 OK):
{
  "id": 1,
  "name": "PayFlow",
  "description": "Modern payment infrastructure for fintech companies",
  "industry": "Fintech",
  "location": "SF",
  "website": "https://payflow.example.com",
  "founded": 2020,
  "employees": 45,
  "signals": 5,
  "enriched": true,
  "enrichment": {
    "summary": "...",
    "whatTheyDo": ["..."],
    "keywords": ["..."],
    "signals": [{"label": "...", "status": true}],
    "sources": [{"url": "...", "timestamp": "..."}],
    "enrichedAt": "2026-02-18T10:42:00Z"
  },
  "notes": "...",
  "saved": true,
  "createdAt": "2026-01-15T08:30:00Z",
  "updatedAt": "2026-02-18T10:42:00Z"
}
```

#### Create Company (Admin Only)
```
POST /companies
Headers: Authorization: Bearer {token}

Request Body:
{
  "name": "NewCo",
  "description": "Description",
  "industry": "SaaS",
  "location": "NYC",
  "website": "https://newco.example.com",
  "founded": 2023,
  "employees": 20
}

Response (201 Created):
{
  "id": 11,
  "name": "NewCo",
  ...
}
```

---

### Enrichment

#### Enrich Company
```
POST /companies/:id/enrich
Headers: Authorization: Bearer {token}

Request Body:
{
  "sourceUrl": "https://company.com" (optional - will use company.website if not provided)
}

Response (202 Accepted):
{
  "enrichmentId": "enrich_abc123",
  "status": "processing",
  "message": "Enrichment started, you'll receive a webhook when complete"
}

Response (400 Bad Request):
{
  "error": "Company already enriched",
  "enrichedAt": "2026-02-18T10:42:00Z"
}

Response (429 Too Many Requests):
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

#### Get Enrichment Status
```
GET /enrichments/:enrichmentId
Headers: Authorization: Bearer {token}

Response (200 OK):
{
  "enrichmentId": "enrich_abc123",
  "companyId": 1,
  "status": "completed|processing|failed",
  "data": {
    "summary": "PayFlow is a fintech infrastructure...",
    "whatTheyDo": [
      "Payment processing API",
      "Real-time settlement",
      "Multi-currency support"
    ],
    "keywords": ["Fintech", "Payments", "API"],
    "signals": [
      {
        "label": "Careers page detected",
        "status": true,
        "source": "https://payflow.example.com/careers"
      }
    ],
    "sources": [
      {
        "url": "https://payflow.example.com",
        "timestamp": "2026-02-18T10:42:00Z",
        "type": "homepage"
      }
    ]
  },
  "completedAt": "2026-02-18T10:44:00Z"
}
```

---

### Lists

#### Get User Lists
```
GET /lists
Headers: Authorization: Bearer {token}

Response (200 OK):
{
  "data": [
    {
      "id": 1,
      "name": "Series A Targets",
      "description": "Companies we're actively tracking",
      "companyCount": 12,
      "createdAt": "2026-01-10T14:20:00Z",
      "updatedAt": "2026-02-18T09:15:00Z"
    }
  ]
}
```

#### Create List
```
POST /lists
Headers: Authorization: Bearer {token}

Request Body:
{
  "name": "Series A Targets",
  "description": "Companies we're actively tracking" (optional)
}

Response (201 Created):
{
  "id": 1,
  "name": "Series A Targets",
  "description": "Companies we're actively tracking",
  "companies": [],
  "createdAt": "2026-02-18T14:20:00Z"
}
```

#### Get List Details
```
GET /lists/:listId
Headers: Authorization: Bearer {token}

Response (200 OK):
{
  "id": 1,
  "name": "Series A Targets",
  "companies": [
    {
      "id": 1,
      "name": "PayFlow",
      "industry": "Fintech",
      "location": "SF",
      "addedAt": "2026-01-10T14:20:00Z"
    }
  ],
  "createdAt": "2026-01-10T14:20:00Z",
  "updatedAt": "2026-02-18T09:15:00Z"
}
```

#### Add Company to List
```
POST /lists/:listId/companies
Headers: Authorization: Bearer {token}

Request Body:
{
  "companyId": 1
}

Response (200 OK):
{
  "id": 1,
  "name": "Series A Targets",
  "companies": [...]
}

Response (409 Conflict):
{
  "error": "Company already in list"
}
```

#### Remove Company from List
```
DELETE /lists/:listId/companies/:companyId
Headers: Authorization: Bearer {token}

Response (204 No Content)
```

#### Export List
```
GET /lists/:listId/export
Headers: Authorization: Bearer {token}
Query Parameters:
  - format: csv|json (default: json)

Response (200 OK):
- Content-Type: text/csv or application/json
- Content-Disposition: attachment
- Returns list data in requested format
```

---

### Saved Searches

#### Get Saved Searches
```
GET /searches
Headers: Authorization: Bearer {token}

Response (200 OK):
{
  "data": [
    {
      "id": 1,
      "query": "fintech",
      "filters": {
        "industry": "Fintech",
        "location": "SF"
      },
      "resultCount": 14,
      "savedAt": "2026-02-18T10:30:00Z"
    }
  ]
}
```

#### Save Search
```
POST /searches
Headers: Authorization: Bearer {token}

Request Body:
{
  "query": "fintech",
  "filters": {
    "industry": "Fintech",
    "location": "SF"
  }
}

Response (201 Created):
{
  "id": 1,
  "query": "fintech",
  "filters": {
    "industry": "Fintech",
    "location": "SF"
  },
  "savedAt": "2026-02-18T10:30:00Z"
}
```

#### Delete Saved Search
```
DELETE /searches/:searchId
Headers: Authorization: Bearer {token}

Response (204 No Content)
```

---

### User Management

#### Get Current User
```
GET /me
Headers: Authorization: Bearer {token}

Response (200 OK):
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "analyst|scout|admin",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

#### Update User Profile
```
PATCH /me
Headers: Authorization: Bearer {token}

Request Body:
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

Response (200 OK):
{
  "id": "user_123",
  "email": "jane@example.com",
  "name": "Jane Doe",
  ...
}
```

#### Get User Preferences
```
GET /me/preferences
Headers: Authorization: Bearer {token}

Response (200 OK):
{
  "theme": "light|dark",
  "itemsPerPage": 10,
  "defaultSort": "name",
  "notifications": {
    "newSignals": true,
    "fundingRounds": true,
    "hires": true
  }
}
```

---

### Authentication

#### Login
```
POST /auth/login

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "expiresIn": 3600
}

Response (401 Unauthorized):
{
  "error": "Invalid credentials"
}
```

#### Register
```
POST /auth/register

Request Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response (201 Created):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}
```

#### Logout
```
POST /auth/logout
Headers: Authorization: Bearer {token}

Response (200 OK):
{
  "message": "Logged out successfully"
}
```

---

### System

#### Health Check
```
GET /health

Response (200 OK):
{
  "status": "ok",
  "timestamp": "2026-02-18T10:42:00Z"
}
```

#### API Metrics
```
GET /metrics
Headers: Authorization: Bearer {token} (admin only)

Response (200 OK):
{
  "companies": {
    "total": 142,
    "enriched": 89
  },
  "users": {
    "total": 15,
    "active": 8
  },
  "enrichments": {
    "processed": 145,
    "failed": 3,
    "avgTime": 2.3
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400,
  "timestamp": "2026-02-18T10:42:00Z",
  "details": {} // optional additional info
}
```

### Common Error Codes

- `INVALID_REQUEST` - 400 Bad Request
- `UNAUTHORIZED` - 401 Unauthorized
- `FORBIDDEN` - 403 Forbidden
- `NOT_FOUND` - 404 Not Found
- `CONFLICT` - 409 Conflict
- `RATE_LIMITED` - 429 Too Many Requests
- `SERVER_ERROR` - 500 Internal Server Error
- `SERVICE_UNAVAILABLE` - 503 Service Unavailable

---

## Webhooks

Webhooks notify your application of important events:

### Enrichment Completed
```
POST {webhook_url}
Headers: X-Webhook-Signature: sha256=...

Body:
{
  "event": "enrichment.completed",
  "enrichmentId": "enrich_abc123",
  "companyId": 1,
  "data": {...}
}
```

### Company Updated
```
POST {webhook_url}

Body:
{
  "event": "company.updated",
  "companyId": 1,
  "changes": ["name", "employees"],
  "updatedAt": "2026-02-18T10:42:00Z"
}
```

---

## Rate Limiting

All endpoints are rate-limited:

- Authenticated requests: 1000 requests/hour
- Enrichment requests: 50/hour
- Search requests: 500/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1645176000
```

---

## Pagination

Paginated responses include:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 142,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Data Types

### Company
```typescript
interface Company {
  id: number
  name: string
  description: string
  industry: string
  location: string
  website: string
  founded: number
  employees: number
  signals: number
  enriched: boolean
  enrichedAt?: string
  createdAt: string
  updatedAt: string
}
```

### Enrichment
```typescript
interface Enrichment {
  summary: string
  whatTheyDo: string[]
  keywords: string[]
  signals: Array<{
    label: string
    status: boolean
    source?: string
  }>
  sources: Array<{
    url: string
    timestamp: string
    type?: string
  }>
}
```

---

## Migration Path from Frontend-Only

To migrate from the current localStorage-based frontend to the API:

1. **Phase 1**: Deploy API endpoints for read operations (GET /companies)
2. **Phase 2**: Implement user authentication and add auth to all endpoints
3. **Phase 3**: Add write operations (POST/PATCH/DELETE endpoints)
4. **Phase 4**: Implement enrichment queue system
5. **Phase 5**: Add webhooks for real-time updates
6. **Phase 6**: Migration tools to sync localStorage data to database

See `DEPLOYMENT.md` for detailed migration instructions.
