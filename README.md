# VC Intelligence Dashboard

A modern VC sourcing tool for discovering, enriching, and comparing startup companies. Built with Next.js, Tailwind CSS, and Groq AI.

https://github.com/Debmalya06/VC-Intelligence/public/demo-video.mp4

<!-- > 🎬 [Watch Demo Video](public/demo-video.mp4) - Run locally to see the full demo -->
## dashboard Preview
![alt text](image.png)
## ✨ Features

| Feature | Description |
|---------|-------------|
| **Company Discovery** | Search & filter companies by industry, location, keywords |
| **AI Enrichment** | One-click enrichment via Groq AI (summary, signals, keywords) |
| **Compare Companies** | Side-by-side comparison with AI-powered analysis |
| **Lists Management** | Create lists, organize companies, export CSV/JSON |
| **Saved Searches** | Quick access to frequently used search criteria |
| **Notes** | Add personal annotations to company profiles |

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (Dark + Green theme)
- **UI**: Shadcn/ui components
- **AI**: Groq API (Llama 3)
- **Storage**: localStorage (client-side)
- **Icons**: Lucide React

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Add your Groq API key to .env.local
GROQ_API_KEY=your_api_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
├── dashboard/
│   ├── companies/      # Company search & profiles
│   ├── lists/          # List management
│   ├── compare/        # Company comparison
│   └── saved/          # Saved searches
├── api/
│   └── enrich/         # AI enrichment endpoint
lib/
├── mockData.js         # Sample company data
└── storage.js          # localStorage utilities
```

## 🔑 Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
```

Get your API key from [console.groq.com](https://console.groq.com)

## 📖 Usage

### Enriching Companies
1. Open a company profile
2. Click **Enrich Now**
3. View AI-generated insights: summary, signals, keywords, sources

### Comparing Companies
1. Go to **Lists** → toggle "Add to Compare" on desired lists
2. Navigate to **Compare**
3. Click **Compare Now** for AI analysis

### Exporting Data
- **Company Profile**: Export JSON/Text
- **Lists**: Export CSV/JSON

## 🚢 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel (recommended)
vercel deploy
```

## 📝 License

MIT License
