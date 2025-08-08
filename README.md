# Fit360 – Your Full Circle of Fitness

Privacy‑first, AI‑powered fitness dashboard that unifies wearables, nutrition, and progress photos into actionable insights.

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS (custom tokens, dark‑mode by default)
- shadcn UI components + Sonner toasts
- Supabase (auth, DB, edge functions)

## Getting Started
```
npm i
npm run dev
```

## Testing
- Vitest + Testing Library
```
npm run test
```

## Project Structure
- src/pages – routes (Landing, Auth, Dashboard)
- src/components – UI and feature components
- src/hooks – reusable hooks (auth, oura, toast)
- src/lib – utilities (cn)
- src/test – test setup

## Design System
- Electric Teal as primary (HSL tokens)
- Accessible, responsive, 8‑pt spacing, large radius cards

## Security
- Do not log raw health data; all tables use RLS in Supabase.
