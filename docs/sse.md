SSE client integration

Overview
- Endpoint: `GET /events` (SSE; JWT Bearer required)
- Events: `connected`, `keepalive` (every ~15s), `thread.title_updated`
- Payload `thread.title_updated`:
  - `threadId: string` (UUID)
  - `title: string`
  - `titleSource: 'ai'|'user'`
  - `updatedAt: string` (ISO-8601)

Client
- File: `src/app/core/services/sse.service.ts`
- Uses `AuthFetchService` to send `Authorization: Bearer <token>` and auto-refresh on 401.
- Parses `text/event-stream` with multi-line `data:` support.
- Reconnects with exponential backoff (1s, 2s, 4s … max 30s).
- Exposes `status` signal with values: `disconnected|connecting|connected|reconnecting`.

Integration
- Bootstrapped by `AppShell` via DI; lifecycle is tied to auth state:
  - On login (tokens present), SSE connects automatically.
  - On logout (tokens cleared), SSE disconnects.
- Threads update on `thread.title_updated` through `ChatService.applyTitleUpdateFromSse(...)`.

UI updates
- Left list shows a badge next to each title: `AI` or `You` based on `titleSource`.
- Thread detail header shows current title + provenance badge.
- Top bar shows a small dot indicating SSE state.

Manual validation
1) Open two tabs.
2) Create a thread (`POST /threads` or via UI and send a message to let AI refine title).
   - Both tabs should receive `thread.title_updated` and update the title live.
3) `PATCH /threads/:id` with a new title.
   - Event with `titleSource='user'` is received and UI switches badge to `You`.
   - Subsequent AI updates should not overwrite a user-provided title (server-side policy).
4) Disable network and re-enable.
   - Indicator goes `reconnecting` → `connected` and keepalive resumes.

Notes
- Token is sent only via `Authorization` header (never in query string).
- CORS/credentials: when no token, client uses `credentials: 'include'`; with token it uses `same-origin`.
- List reorder: threads reorder by `updatedAt` DESC on title updates.

