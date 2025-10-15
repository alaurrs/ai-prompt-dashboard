# AI Prompt Dashboard

Modern Angular app for managing AI chat threads with prompt templates, streaming responses, and a clean 3‑pane layout. Built with Angular 20 (standalone), PrimeNG (unstyled), Tailwind CSS 4, and design tokens.

Key features:
- Chat with streaming assistant responses (SSE)
- Thread list with search and quick actions
- Prompt panel (right sidebar) for reusable starters
- Light/Dark/Auto theming via tokens and a toggle
- Local caching of threads, prompts, and settings

See an overview of the codebase in `PROJECT_STRUCTURE.md`.

## Getting Started

Prerequisites:
- Node.js 18.19+ or 20+
- npm 9+

Install dependencies and start the dev server:

```bash
npm install
npm run start
```

Open `http://localhost:4200/` in your browser. The app reloads on changes.

## Configuration

Edit `src/environment/environment.ts` to point the UI to your backend:

```ts
export const environment = {
  production: false,
  apiBase: 'http://localhost:8080/api',
  demoEmail: 'me@example.com', // sent as X-Demo-Email header
};
```

HTTP requests are automatically prefixed with `environment.apiBase` by `src/app/core/adapters/http.adapter.ts`, and the `X-Demo-Email` header is attached to each request.

## API Expectations

The UI expects a minimal Threads/Messages API and a streaming SSE endpoint:

- `GET   /threads?limit=20&cursor=...`
- `POST  /threads` body: `{ title, model, systemPrompt? }`
- `PATCH /threads/{id}`
- `GET   /threads/{id}`
- `GET   /threads/{id}/messages?afterPosition=-1&limit=200`
- `POST  {apiBase}/threads/{id}/respond` (text/event-stream)

Streaming endpoint (`respond`) sends SSE events:
- `event: created` with data = assistant message id (optional)
- `event: token`   with data = next text token (whitespace preserved)
- `event: done`    when stream completes
- `event: error`   with data = error message

Client code handling this lives in `src/app/core/adapters/ai-sse.adapter.ts` and `src/app/core/services/chat.service.ts`.

## Scripts

From `package.json`:
- `npm run start` – serve in development
- `npm run build` – build (default prod config)
- `npm run build:prod` – production build with hashing/budgets
- `npm run watch` – watch build in development mode
- `npm run lint` – run Angular ESLint if configured
- `npm run test` – run unit tests (Karma/Jasmine)

## Tech Stack

- Angular 20 (standalone components, signals)
- PrimeNG 20 (unstyled; custom tokens/styles)
- Tailwind CSS 4 + `tailwindcss-primeui`
- RxJS 7, Zone.js

Global styles are defined in:
- `src/styles.css` (Tailwind setup and variants)
- `src/styles/index.scss` (design tokens and component recipes)
- `src/styles/theme/_tokens.scss` (colors, spacing, radius, etc.)

Dark mode toggles the `app-dark` class on `:root` via `src/app/core/services/theme.service.ts`.

## Data & Caching

LocalStorage is used for fast startup and offline resilience via `src/app/core/services/storage.service.ts`:
- Threads cache: key `apd:threads:v1`
- Settings: key `apd:settings:v1` (includes theme)
- Prompt templates: key `apd:prompts:v1`

## Development Notes

- Primary app entry: `src/app/app.ts` and `src/app/app.routes.ts`
- Main Chat page: `src/app/features/chat/`
- Shell layout and panels: `src/app/shared/ui/app-shell/`
- Core services and adapters: `src/app/core/`

Generate components with Angular CLI if needed:

```bash
ng g c path/to/your-component --standalone
```

## Testing

Run unit tests:

```bash
npm test
```

## Troubleshooting

- 404s to `/threads` or SSE errors usually indicate `environment.apiBase` is incorrect or the backend isn’t running.
- If tokens appear trimmed, ensure the SSE stream preserves whitespace; the client intentionally does not trim token payloads.

— Updated Oct 2025
