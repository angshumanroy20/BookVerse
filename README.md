# Miaoda — BookVerse (Project Overview & Setup)

A polished, responsive BookVerse web application built with TypeScript + React (Vite). This repo bundles a modern UI, music player, web-search integration, and a complete documentation set to help you develop, run, and deploy the app quickly.

## Key Features
- Clean, modern UI and smooth animations
- Built-in MusicPlayer component [`MusicPlayer`](src/components/common/MusicPlayer.tsx)
- Search and web integration (Google Custom Search)
- Lazy loading, pagination, caching, CDN-ready assets
- Strict TypeScript + ESLint rules; responsive and accessible

## Quick Links
- Source entry: [`App`](src/App.tsx) — [src/App.tsx](src/App.tsx)
- App bootstrap: [src/main.tsx](src/main.tsx)
- Global styles: [src/index.css](src/index.css)
- Components: [src/components](src/components)
- Pages (example): [src/pages/Browse.tsx](src/pages/Browse.tsx)
- Config files: [package.json](package.json), [components.json](components.json), [biome.json](biome.json), [index.html](index.html)
- Environment template: [.env](.env)
- Docs: [FEATURE_SUMMARY.md](FEATURE_SUMMARY.md), [FINAL_IMPLEMENTATION_SUMMARY.md](FINAL_IMPLEMENTATION_SUMMARY.md), [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md), [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md), [GOOGLE_SEARCH_SETUP.md](GOOGLE_SEARCH_SETUP.md)

## Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- Google API key & Search Engine ID (if using Web Search features) — see [GOOGLE_SEARCH_SETUP.md](GOOGLE_SEARCH_SETUP.md)

## Local Setup (Quick)
1. Install dependencies
   ```sh
   npm install
   ```
2. Create `.env` in project root and add keys (see [GOOGLE_SEARCH_SETUP.md](GOOGLE_SEARCH_SETUP.md)):
   ```
   VITE_GOOGLE_API_KEY=your_key_here
   VITE_GOOGLE_SEARCH_ENGINE_ID=your_engine_id
   ```
3. Run dev server
   ```sh
   npm run dev
   ```
4. Build for production
   ```sh
   npm run build
   npm run preview
   ```

(If your `package.json` uses different scripts, replace the commands above with the appropriate ones found in [package.json](package.json).)

## Testing & Linting
- Lint: `npm run lint` (project configured; linting passes per docs)
- Tests: `npm run test` (if tests are included)

## Project Structure (high level)
- src/
  - App entry: [`App`](src/App.tsx)
  - components/: UI building blocks — [src/components](src/components)
  - pages/: route pages (e.g., [src/pages/Browse.tsx](src/pages/Browse.tsx))
  - styles: [src/index.css](src/index.css)
- public/: static assets
- .env: environment variables (local only; gitignored)

## Deployment Notes
- See [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) for production steps, API key restrictions, and recommended security practices.
- Docs and configuration for web search: [GOOGLE_SEARCH_SETUP.md](GOOGLE_SEARCH_SETUP.md)

## Documentation & Design Notes
- Full feature overview: [FEATURE_SUMMARY.md](FEATURE_SUMMARY.md)
- Final implementation notes: [FINAL_IMPLEMENTATION_SUMMARY.md](FINAL_IMPLEMENTATION_SUMMARY.md)
- Implementation checklist: [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)

## Contributing
- Follow existing TypeScript + ESLint conventions.
- Keep changes modular and documented.
- Update related markdown docs when altering features or env requirements.

## Support
- Use the included documentation files for troubleshooting and guides.
- For deployment help, consult [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) and [GOOGLE_SEARCH_SETUP.md](GOOGLE_SEARCH_SETUP.md).

Enjoy developing with Miaoda / BookVerse — clean architecture and comprehensive docs are included to get you from info to setup fast.
