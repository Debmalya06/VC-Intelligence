# VC Intelligence - Quick Reference Guide

## Getting Started (30 seconds)

```bash
# Install & start
pnpm install
pnpm dev

# Open http://localhost:3000
```

---

## File Guide

| File | Purpose | When to Edit |
|------|---------|--------------|
| `app/page.jsx` | Home redirect | Change landing page |
| `app/layout.jsx` | Root layout | Update metadata, fonts |
| `app/globals.css` | Design tokens | Change colors, typography |
| `app/dashboard/layout.jsx` | App shell | Add sidebar items |
| `app/dashboard/companies/page.jsx` | Company search | Add filters |
| `app/dashboard/companies/[id]/page.jsx` | Company details | Modify enrichment UI |
| `app/dashboard/lists/page.jsx` | Lists management | Customize list features |
| `app/dashboard/saved/page.jsx` | Saved searches | Customize search UI |
| `lib/mockData.js` | Sample data | Add/remove companies |
| `lib/storage.js` | localStorage helpers | Add storage features |

---

## Key Features

### Search Companies
```javascript
// In Companies page
<input
  type="text"
  placeholder="Search companies, keywords…"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

### Filter Results
```javascript
// Industry filter
<select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
  <option value="">All Industries</option>
  {industries.map((ind) => <option>{ind}</option>)}
</select>
```

### Enrich Companies
```javascript
// Click Enrich button on company profile
const handleEnrich = async () => {
  setIsEnriching(true);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  setEnrichmentData(mockData);
  setIsEnriching(false);
};
```

### Save Companies
```javascript
// Toggle save status
const toggleSave = (companyId) => {
  const updated = storage.toggleSavedCompany(companyId);
  setSavedCompanies(updated);
};
```

### Create Lists
```javascript
const createNewList = () => {
  const newList = {
    id: Date.now(),
    name: newListName,
    companies: [],
  };
  saveLists([...lists, newList]);
};
```

---

## Common Tasks

### Add a New Company

Edit `lib/mockData.js`:

```javascript
{
  id: 11,
  name: 'NewCo',
  description: 'Description',
  industry: 'SaaS',
  location: 'SF',
  signals: 5,
  enriched: true,
  founded: 2023,
  website: 'https://newco.com',
  employees: 30,
  summary: 'Summary',
  whatTheyDo: ['...', '...'],
  keywords: ['...'],
  signals: [{label: '...', status: true}],
  sources: [{url: '...', timestamp: '...'}],
}
```

### Change Brand Color

Edit `app/globals.css`:

```css
:root {
  --primary: #0066cc;  /* Change this */
  /* ... other colors ... */
}
```

### Add a New Page

1. Create `app/dashboard/new-feature/page.jsx`
2. Add to navigation in `app/dashboard/layout.jsx`:

```javascript
{ name: 'New Feature', href: '/dashboard/new-feature', icon: Icon }
```

### Export Data

```javascript
const handleExport = (format) => {
  const content = format === 'json' ? JSON.stringify(data) : csvString;
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', `file.${format}`);
  element.click();
};
```

---

## Storage Keys

```javascript
// Companies saved by user
localStorage.getItem('savedCompanies')  // Array of IDs

// Notes for specific company
localStorage.getItem('notes-1')  // String

// Enrichment cache
localStorage.getItem('enrichment-1')  // JSON

// Lists
localStorage.getItem('lists')  // Array of lists

// Saved searches
localStorage.getItem('savedSearches')  // Array of searches

// User preferences
localStorage.getItem('userPreferences')  // Settings object
```

---

## Component Structure

### Page Template

```javascript
'use client';

import { useState, useEffect } from 'react';

export default function PageName() {
  const [state, setState] = useState('');

  useEffect(() => {
    // Load data
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Content */}
    </div>
  );
}
```

### Card Component

```javascript
<div className="bg-card rounded-lg border border-border p-6">
  <h2 className="text-lg font-semibold text-foreground mb-4">Title</h2>
  {/* Content */}
</div>
```

### Button

```javascript
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors">
  Click me
</button>
```

---

## API Integration (When Ready)

### Replace Mock Data with API

```javascript
// Before (mock data)
import { mockCompanies } from '@/lib/mockData';

// After (real API)
const [companies, setCompanies] = useState([]);

useEffect(() => {
  const fetchCompanies = async () => {
    const res = await fetch('/api/companies');
    const data = await res.json();
    setCompanies(data.data);
  };
  fetchCompanies();
}, []);
```

### Enrichment API Call

```javascript
const handleEnrich = async () => {
  setIsEnriching(true);
  try {
    const res = await fetch(`/api/companies/${id}/enrich`, {
      method: 'POST',
    });
    const data = await res.json();
    setEnrichmentData(data.data);
  } catch (error) {
    console.error('Enrichment failed:', error);
  }
  setIsEnriching(false);
};
```

---

## Styling Guide

### Responsive Design

```javascript
// Desktop first
<div className="grid grid-cols-3 gap-6">
  {/* 3 columns on desktop */}
</div>

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### Common Classes

```javascript
// Layout
'p-6'                              // Padding
'space-y-4'                        // Vertical spacing
'flex items-center justify-between' // Flexbox
'grid grid-cols-2 gap-4'          // Grid

// Colors
'bg-card'                          // Card background
'text-foreground'                  // Text color
'border border-border'             // Border
'text-muted-foreground'            // Muted text

// States
'hover:bg-secondary'               // Hover
'focus:ring-2 focus:ring-primary'  // Focus
'disabled:opacity-50'              // Disabled

// Typography
'font-semibold'                    // Bold
'text-sm'                          // Small
'uppercase'                        // Uppercase
```

---

## Icons (Lucide React)

```javascript
import { 
  Building2, 
  ListTodo, 
  Bookmark, 
  Search, 
  Zap,
  Star,
  Download,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// Use icons
<Search size={20} />
<Star size={18} fill="currentColor" />
```

---

## Testing Checklist

- [ ] Search filters work
- [ ] Sorting works on all columns
- [ ] Pagination works
- [ ] Save/unsave toggles
- [ ] Enrichment process completes
- [ ] Notes persist after refresh
- [ ] Lists can be created/deleted
- [ ] Export as CSV/JSON works
- [ ] Mobile responsive
- [ ] All links work

---

## Deployment

### Deploy to Vercel (1 minute)

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Visit vercel.com → Import → Select repo → Deploy

### Deploy Locally

```bash
pnpm build
pnpm start
# Visit http://localhost:3000
```

---

## Helpful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Run production build
pnpm lint                   # Check code quality

# Git
git status                  # Check changes
git add .                   # Stage all
git commit -m "message"     # Commit
git push origin main        # Push to main

# Cleanup
rm -rf .next                # Clear Next.js cache
pnpm install                # Reinstall dependencies
```

---

## Performance Tips

- Add pagination to large tables
- Use `useMemo` for expensive calculations
- Implement lazy loading for lists
- Cache API responses
- Optimize images with Next.js Image component
- Use production builds for testing

---

## Security Checklist

- [ ] No API keys in frontend code
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Set secure headers
- [ ] Rate limit API endpoints
- [ ] Sanitize database queries

---

## Debugging

```javascript
// Log component renders
console.log('[v0] Component rendered:', state);

// Log API responses
console.log('[v0] API response:', data);

// Log errors
console.error('[v0] Error:', error.message);

// Log state changes
useEffect(() => {
  console.log('[v0] State updated:', state);
}, [state]);
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev

---

## File Size Guide

- Page component: 200-400 lines
- Layout component: 100-200 lines
- Utility file: 50-100 lines
- Keep components focused and reusable

---

## Next Steps

1. **Deploy**: Push to GitHub and deploy to Vercel
2. **Customize**: Update colors, add more companies
3. **Develop**: Add database and backend API
4. **Scale**: Implement real enrichment service
5. **Market**: Deploy and share with users

---

## Support

See full documentation:
- `README.md` - User guide
- `API_SPECIFICATION.md` - Backend API design
- `DEPLOYMENT.md` - Production setup
- `BACKEND_EXAMPLES.md` - Code examples

---

**Happy coding! 🚀**
