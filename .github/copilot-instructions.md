# Consent Manager

A lightweight, self-hosted Cookie Consent Manager (CMP). The frontend bundles all domain configurations at build time for fully autonomous operation.

## Project Structure

- `src/consent.js` - Source consent script
- `dist/consent.min.js` - Built bundle with embedded configs (generated)
- `src/configs/*.json` - Domain configuration files
- `src/configs/vendors.json` - Vendor definitions with translations
- `public/index.html` - Test page
- `scripts/build.js` - Build script with config bundling and watch mode
- `server/index.js` - Development server with hot-reload

## Commands

- `npm run build` - Build minified bundle to dist/
- `npm run dev` - Start dev server with hot-reload
- `npm start` - Alias for dev server

## Key Features

- CONFIGS constant is injected at build time from all `src/configs/*.json` files
- No external API calls needed at runtime
- Watch mode rebuilds on config or source changes
- Domain lookup via `data-domain` attribute on script tag
