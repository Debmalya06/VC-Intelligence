# VC Intelligence Dashboard

A modern, premium SaaS tool for discovering and enriching startup companies. Built with Next.js 16, React 19, and Tailwind CSS.

## Features

### Core Features
- **Company Discovery**: Search and filter companies by industry, location, and keywords
- **Company Profiles**: Detailed company information with enrichment capabilities
- **Smart Enrichment**: Click "Enrich" to fetch and display company insights including:
  - Executive summary
  - What they do (bullet points)
  - Keywords and tags
  - Derived signals (careers page, blog, changelog, etc.)
  - Source URLs with timestamps
- **Lists Management**: Create custom lists, organize companies, and export as CSV/JSON
- **Saved Searches**: Save frequently used search criteria for quick access
- **Notes & Annotations**: Add personal notes to company profiles
- **Data Export**: Export company data and enrichment results in JSON or CSV formats

### Tech Stack
- **Frontend**: Next.js 16, React 19, JavaScript/JSX
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Storage**: localStorage (client-side persistence)
- **State Management**: React hooks (useState, useContext)

## Project Structure

```
app/
├── layout.jsx                 # Root layout with metadata
├── page.jsx                   # Redirect to dashboard
├── globals.css                # Global styles and design tokens
└── dashboard/
    ├── layout.jsx            # Dashboard shell with sidebar navigation
    ├── companies/
    │   ├── page.jsx          # Company search & filter page
    │   └── [id]/
    │       └── page.jsx      # Company profile page with enrichment
    ├── lists/
    │   └── page.jsx          # Lists management page
    └── saved/
        └── page.jsx          # Saved searches page

lib/
├── mockData.js               # Mock company data for development
└── storage.js                # localStorage utilities

components/
└── ui/                       # Shadcn UI components (pre-installed)
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd vc-intelligence

# Install dependencies (uses pnpm by default)
npm install
# or
pnpm install
# or
yarn install
```

### Running Locally

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically redirect to `/dashboard/companies`.

### Build for Production

```bash
npm run build
npm run start
# or
pnpm build
pnpm start
```

## Usage Guide

### Discovering Companies

1. Navigate to **Companies** in the sidebar
2. Use the search bar to find companies by name or keywords
3. Filter by Industry or Location
4. Sort results by clicking column headers
5. Click on a company name to view its profile

### Enriching Company Data

1. Open a company profile
2. Click the **Enrich Now** button (blue button with lightning icon)
3. Wait for enrichment to complete (simulated 2-second delay)
4. View:
   - AI-generated summary
   - Key business activities
   - Relevant keywords and tags
   - Derived signals (presence of careers page, blog, etc.)
   - Source URLs with timestamps

### Creating Lists

1. Go to **Lists** in the sidebar
2. Click **New List**
3. Name your list
4. Save companies to the list from the Companies page
5. Export lists as CSV or JSON

### Saving Searches

1. From the **Saved Searches** page, click **Save Current Search**
2. Name your search
3. Use the Play button to re-run saved searches
4. Quickly filter by saved criteria

### Exporting Data

#### Company Profiles
- Click **Export JSON** or **Export Text** on the company profile
- Includes enrichment data and your notes

#### Lists
- From the list view, click **Export CSV** or **Export JSON**
- CSV format is ideal for spreadsheet applications
- JSON includes full company metadata

## Design System

### Color Palette

**Light Mode:**
- Primary: `#0066cc` (Blue)
- Background: `#ffffff` (White)
- Foreground: `#0f0f0f` (Near Black)
- Muted: `#e8e8e8` (Light Gray)
- Border: `#e5e5e5` (Subtle Gray)

**Dark Mode:**
- Primary: `#3b82f6` (Light Blue)
- Background: `#0a0a0a` (Nearly Black)
- Foreground: `#f5f5f5` (Off White)
- Muted: `#2a2a2a` (Dark Gray)
- Border: `#2a2a2a` (Dark Gray)

### Typography

- **Headings**: Geist (default Next.js font)
- **Body**: Geist (clean, modern sans-serif)
- **Font Sizes**: Semantic scale (text-xs to text-2xl)

### Components

All UI components are from Shadcn, providing:
- Accessible form elements (Input, Select, Checkbox, etc.)
- Layout components (Card, Separator, etc.)
- Advanced components (Dialog, Popover, Tabs, etc.)
- Custom components specific to this design system

## Mock Data

The app comes pre-loaded with 10 sample companies across 6 industries:

- **Fintech**: PayFlow, SecureNet
- **SaaS**: CloudScale, DataFlow Pro, APIConnect, ShopHub
- **AI/ML**: AIAssist, MarketLens
- **Web3**: BlockVault
- **Healthcare**: HealthAI

Companies have realistic data including:
- Industry, location, employee count
- Enrichment status
- Signal counts
- Sample enrichment data (summary, what they do, keywords, signals, sources)

## localStorage Keys

The app persists data using the following keys:

```javascript
'savedCompanies'       // Array of saved company IDs
'notes-{companyId}'    // Notes for a specific company
'enrichment-{companyId}' // Cached enrichment data
'lists'                // List definitions and company mappings
'savedSearches'        // Saved search queries and filters
'userPreferences'      // Sort order, pagination settings
```

## API Integration (Future)

When ready to add backend:

1. Create API routes in `app/api/`
2. Implement enrichment endpoint: `GET /api/enrich?url=...`
3. Replace mock data with API calls to company database
4. Move storage from localStorage to database

### Enrichment API Endpoint (Planned)

```javascript
POST /api/enrich
{
  "companyId": 1,
  "companyUrl": "https://example.com"
}

Response:
{
  "summary": "...",
  "whatTheyDo": ["...", "..."],
  "keywords": ["...", "..."],
  "signals": [{label: "...", status: true}],
  "sources": [{url: "...", timestamp: "..."}]
}
```

## Performance Optimizations

- Pagination: 10 companies per page (configurable in user preferences)
- Client-side filtering and sorting (no server round-trips)
- Lazy loading of enrichment data
- localStorage caching of enrichment results
- Optimized SVG icons with Lucide React

## Accessibility

- Semantic HTML elements (main, header, nav)
- ARIA labels on interactive elements
- Focus indicators on buttons and form fields
- Keyboard navigation support
- Color contrast meets WCAG AA standards
- Screen reader friendly form labels

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Environment Variables

Currently uses no environment variables (all data is local).

When adding backend:
```
NEXT_PUBLIC_API_URL=https://api.example.com
API_KEY=your-api-key
```

## Development Tips

### Adding New Companies

Edit `lib/mockData.js` and add to the `mockCompanies` array.

### Customizing Colors

Edit `app/globals.css` in the `:root` and `.dark` sections.

### Adding New Pages

1. Create folder in `app/dashboard/`
2. Create `page.jsx` with React component
3. Add navigation item in `app/dashboard/layout.jsx`

### Testing localStorage

Use the storage utilities in `lib/storage.js`:
```javascript
import { storage } from '@/lib/storage';

// Get saved companies
const saved = storage.getSavedCompanies();

// Toggle save
storage.toggleSavedCompany(1);

// Clear all data
storage.clearAll();
```

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Vercel will auto-detect Next.js and deploy
```

### Deploy to Netlify

```bash
npm run build
# Upload 'out' folder to Netlify
```

## Future Enhancements

- Backend database integration (Supabase, PostgreSQL)
- Real API enrichment (Clearbit, Hunter, etc.)
- User authentication and team collaboration
- Webhook integrations (Slack, Zapier)
- Advanced analytics and reporting
- Bulk actions (enrich multiple companies)
- Vector search for company similarity
- Startup signals (funding, hiring, tech stack)
- Email notifications for company updates
- Customizable enrichment rules

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues or feature requests, please open an issue in the repository.
