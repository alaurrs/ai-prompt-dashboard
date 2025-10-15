# Project Structure — AI Prompt Dashboard

This document explains how the codebase is organized and where to find key pieces.

## Top-Level Layout

```
ai-prompt-dashboard/
├─ README.md
├─ PROJECT_STRUCTURE.md
├─ angular.json
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.spec.json
├─ public/
│  └─ favicon.ico
└─ src/
   ├─ index.html
   ├─ main.ts
   ├─ styles.css                 # Tailwind CSS 4 entry (and PrimeUI plugin)
   ├─ styles/
   │  ├─ fonts.css               # @fontsource/inter
   │  ├─ index.scss              # SCSS entry (tokens + recipes)
   │  ├─ _reset.scss
   │  ├─ _primitives.scss
   │  ├─ components/
   │  │  ├─ _button.scss
   │  │  ├─ _card.scss
   │  │  ├─ _input.scss
   │  │  ├─ _tabs.scss
   │  │  ├─ _dialog.scss
   │  │  ├─ _textarea.scss
   │  │  ├─ _select.scss
   │  │  ├─ _checkbox.scss
   │  │  ├─ _list.scss
   │  │  └─ _bubble.scss
   │  └─ theme/
   │     └─ _tokens.scss         # Design tokens (colors, spacing, radius...)
   ├─ environment/
   │  └─ environment.local.ts    # apiBase and demoEmail
   └─ app/
      ├─ app.ts                  # Root component
      ├─ app.html
      ├─ app.css
      ├─ app.config.ts           # Providers (Router, PrimeNG, HttpClient + interceptors)
      ├─ app.routes.ts           # Route definitions
      ├─ app.spec.ts
      ├─ core/
      │  ├─ adapters/
      │  │  ├─ adapter.types.ts  # ChatAdapter contract
      │  │  ├─ mock.adapter.ts   # Local mock streaming
      │  │  ├─ http.adapter.ts   # HttpInterceptor for base URL + headers
      │  │  ├─ threads.adapter.ts
      │  │  ├─ messages.adapter.ts
      │  │  └─ ai-sse.adapter.ts # SSE client for streaming responses
      │  ├─ models/
      │  │  ├─ app-settings.model.ts
      │  │  ├─ chat-message-input.model.ts
      │  │  ├─ chat-message.model.ts
      │  │  ├─ chat-request.model.ts
      │  │  ├─ chat-thread.model.ts
      │  │  ├─ prompt-template.model.ts
      │  │  ├─ provided-settings.model.ts
      │  │  └─ role.model.ts
      │  └─ services/
      │     ├─ chat.service.ts   # Orchestrates threads, messages, SSE streaming
      │     ├─ storage.service.ts# LocalStorage caching
      │     └─ theme.service.ts  # Theme toggle: light/dark/auto
      ├─ features/
      │  ├─ chat/
      │  │  ├─ chat.page.ts      # Main chat page (standalone)
      │  │  ├─ chat.page.html
      │  │  └─ chat.page.scss
      │  └─ prompts/
      │     └─ right-panel/
      │        ├─ right-panel.component.ts
      │        ├─ right-panel.component.html
      │        └─ right-panel.component.scss
      └─ shared/
         └─ ui/
            └─ app-shell/
               ├─ app-shell.component.ts
               ├─ app-shell.component.html
               ├─ app-shell.component.scss
               └─ left-panel/
                  ├─ left-panel.component.ts
                  ├─ left-panel.component.html
                  ├─ left-panel.component.scss
                  ├─ left-panel.types.ts
                  └─ left-panel.mock.ts
```

## Architectural Layers

- Core (`src/app/core`)
  - Adapters integrate with external services (REST + SSE) and provide a mock.
  - Models define shared types.
  - Services provide app-wide behavior (chat orchestration, caching, theming).

- Features (`src/app/features`)
  - Vertical slices of UI/logic. The `chat` feature renders the 3‑pane chat.

- Shared (`src/app/shared`)
  - Reusable UI building blocks, such as the application shell and side panels.

- Styles (`src/styles` and `src/styles.css`)
  - Tailwind CSS 4 entry (`styles.css`) and SCSS recipes (`index.scss`).
  - Token‑driven theming in `theme/_tokens.scss` with `app-dark` class support.

## Notable Behaviors

- Base HTTP config: `src/app/core/adapters/http.adapter.ts` prefixes relative URLs with `environment.apiBase` and adds `X-Demo-Email`.
- Streaming: `src/app/core/adapters/ai-sse.adapter.ts` consumes SSE with events `created`, `token`, `done`, `error` without trimming whitespace for tokens.
- Caching keys (LocalStorage):
  - Threads: `apd:threads:v1`
  - Settings: `apd:settings:v1`
  - Prompts: `apd:prompts:v1`

## Conventions

- Components: `*.component.ts` (paired `.html`/`.scss`)
- Pages/feature entries: `*.page.ts`
- Services: `*.service.ts`
- Models: `*.model.ts`
- Style partials: `_*.scss`

— Updated Oct 2025

