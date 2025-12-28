# FlexiLivre Consent Manager

A lightweight, self-hosted Cookie Consent Manager (CMP) similar to Axeptio. It features a Vanilla JS frontend that bundles all configurations at build time for fully autonomous operation (no external API required).

## Features

- **Autonomous Bundle:** All domain configs are embedded at build time - no server-side API needed.
- **Multi-Site & Multi-Language:** Supports multiple websites and languages via JSON configuration.
- **Consent Tracking:** Stores consent in cookies with configurable durations (13 months for full consent, 7 days for partial/none).
- **Public SDK:** Expose `window.fcm.show()` to programmatically show the consent banner.
- **Bot Detection:** Dev server blocks consent scripts for known bots and crawlers.
- **Lightweight:** Frontend has zero runtime dependencies.
- **Hot Reload:** Development mode watches config changes and rebuilds automatically.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Development

Start the development server with hot-reload:

```bash
npm run dev
```

The server runs on `http://localhost:3000`. Changes to `src/configs/*.json` or `src/consent.js` trigger automatic rebuilds.

## Build

Build the minified bundle with embedded configs:

```bash
npm run build
```

This outputs `dist/consent.min.js` with all domain configurations bundled inside.

## Deployment

Simply host `dist/consent.min.js` on any static file server (Nginx, Apache, CDN, S3, etc.). The file is fully self-contained.

## Configuration

Configurations are stored in the `src/configs/` directory. Each domain has its own config file.

Example `src/configs/flexilivre.com.json`:
```json
{
  "domain": ".flexilivre.com",
  "language": "fr",
  "enabledVendors": ["google_analytics", "facebook"],
  "translations": {
    "title": "Nous utilisons des cookies",
    "description": "...",
    "acceptButton": "Accepter",
    "configureButton": "Configurer"
  }
}
```

Vendor definitions are in `src/configs/vendors.json` with translations for each supported language.

## Integration

Add the consent script to your website:

```html
<script src="https://your-cdn.com/consent.min.js" data-domain="flexilivre.com"></script>
```

**Note:** The `data-domain` attribute must match a domain key in your config files (e.g., `flexilivre.com`).

To programmatically show the banner (e.g., from a "Manage cookies" link):

```javascript
window.fcm.show();
```

## Cookies

The consent manager uses two cookies:

- `fcm_consent` - JSON object containing: token, vendors array, status, and date
- `fcm_authorized_vendors` - Comma-separated list for tag manager integration (e.g., `,google_analytics,facebook,`)

