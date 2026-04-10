# GATE 2027 Tracker 🚀

A comprehensive, personal exam preparation tracker designed for GATE CS aspirants. This application helps you manage your syllabus, track daily consistency, analyze mock test performance, and project your final score using smart data-driven formulas.

## ✨ Key Features

- **📊 Dynamic Dashboard:** Get a bird's-eye view of your preparation with study heatmaps, score gauges, and streak trackers.
- **📚 Syllabus Manager:** Track completion of 12 GATE CS subjects and 50+ topics with priority tagging and markdown notes.
- **📅 Daily Study Log:** A calendar-based logging system to record your focus, mood, productivity, and PYQ accuracy.
- **📝 Markdown Notes:** A dedicated space for technical notes with split-view preview and subject/topic tagging.
- **📈 Mock Test Analytics:** Intelligent parser for Testbook/Made Easy results, subject-wise breakdown, and trend analysis.
- **🎯 Score Evaluation:** Smart projection formula that estimates your GATE score based on real-time preparation data.
- **🗺️ 4-Phase Roadmap:** A built-in strategic plan covering Foundation, Core CS, PYQ Grind, and Final Sprint.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand (with Persistence)
- **Charts:** Recharts
- **Icons:** Lucide React

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase project

### 2. Local Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd gate-tracker

# Install dependencies
npm install

# Setup environment variables
# Create a .env.local file in the root
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 3. Database Setup
Run the SQL schema and seed data found in `CHUNK 2` documentation (or the provided SQL files) in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```

## 📦 Deployment

### Vercel
1. Push your code to GitHub.
2. Connect your repo to Vercel.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to environment variables.
4. Vercel will auto-deploy on every push.

## 📄 License
MIT
