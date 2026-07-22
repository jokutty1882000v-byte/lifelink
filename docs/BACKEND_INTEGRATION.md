# LifeLink — Backend Integration Guide

This document specifies exactly what the Angular frontend expects from the Python
(FastAPI-recommended) backend. Follow this spec and the frontend will "just work"
with zero code changes on the client side.

---

## 1. Environment switch

The frontend runs against mock JSON by default. To point it at your real backend:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api',   // your FastAPI root
  wsBaseUrl:  'ws://localhost:8000/ws',      // WebSocket root
  useMockApi: false,                         // <-- flip this
  // …rest unchanged
};
```

Restart `npm start` after editing. No other frontend change is needed.

---

## 2. CORS setup (FastAPI)

FastAPI must allow the frontend origin, credentials, and the `Authorization` header:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",           # dev
        "https://app.lifelink.example.com" # prod
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

---

## 3. Response envelope

**Every JSON endpoint must return this shape** (the frontend `ApiService` unwraps it):

```json
{
  "data": <the actual payload>,
  "message": "optional human-readable success message",
  "timestamp": "2026-07-22T09:30:00Z"
}
```

FastAPI helper:

```python
from datetime import datetime, timezone
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class ApiResult(BaseModel, Generic[T]):
    data: T
    message: Optional[str] = None
    timestamp: str = datetime.now(timezone.utc).isoformat()
```

**Errors** must follow FastAPI's default shape (the interceptor already parses it):

```json
{ "detail": "Invalid credentials" }
{ "detail": [{ "loc": ["body","email"], "msg": "invalid email", "type": "value_error" }] }
```

---

## 4. Auth flow

### 4.1 Login
`POST /api/auth/login`

Request:
```json
{ "email": "user@example.com", "password": "correcthorsebattery" }
```

Response `data`:
```json
{
  "user": { "id": "u-1", "fullName": "Aarav Sharma", "email": "user@example.com",
            "phone": "+91...", "role": "donor", "bloodGroup": "O+",
            "isVerified": true, "createdAt": "...", "updatedAt": "..." },
  "tokens": { "accessToken": "eyJ…", "refreshToken": "eyJ…", "expiresIn": 3600 }
}
```

### 4.2 Register
`POST /api/auth/register` — same response shape as login. Also creates the donor
profile row when `role === "donor"`.

### 4.3 Refresh
`POST /api/auth/refresh`

Request:
```json
{ "refreshToken": "eyJ…" }
```

Response `data`:
```json
{ "accessToken": "eyJ…", "refreshToken": "eyJ…", "expiresIn": 3600 }
```

The frontend calls this automatically on any 401 (see `RefreshCoordinator`).
Return a fresh `refreshToken` too (rotation) — the frontend stores whatever you send.

### 4.4 Logout
`POST /api/auth/logout` — no body. The frontend clears its local storage regardless
of the response.

### 4.5 Bearer header
Every authenticated request carries:
```
Authorization: Bearer <accessToken>
```

---

## 5. Domain endpoints

Full list matches `src/app/core/constants/api-endpoints.ts`. Path params in `{}`:

### Donors
| Method | Path | Body / Query | Response `data` |
|---|---|---|---|
| GET  | `/donors`               | —                             | `Donor[]` |
| POST | `/donors/search`        | `DonorSearchQuery`            | `RankedDonor[]` |
| GET  | `/donors/{id}`          | —                             | `Donor` |
| POST | `/donors/{id}/contact`  | `{ requestId: string }`       | `{ ok: boolean }` |

### Hospitals
| Method | Path | Query | Response `data` |
|---|---|---|---|
| GET | `/hospitals`         | —                                | `Hospital[]` |
| GET | `/hospitals/nearby`  | `lat, lng, radiusKm`             | `Hospital[]` |
| GET | `/hospitals/{id}`    | —                                | `Hospital` |

### Blood Banks — same pattern under `/blood-banks`.

### Requests
| Method | Path | Body | Response `data` |
|---|---|---|---|
| GET    | `/requests`            | —                       | `BloodRequest[]` |
| GET    | `/requests/mine`       | —                       | `BloodRequest[]` |
| POST   | `/requests`            | `CreateBloodRequest`    | `BloodRequest` |
| POST   | `/requests/{id}/fulfill` | —                     | `BloodRequest` |
| DELETE | `/requests/{id}`       | —                       | `void` |

### Notifications
| Method | Path | Response `data` |
|---|---|---|
| GET  | `/notifications`             | `AppNotification[]` |
| POST | `/notifications/{id}/read`   | `void` |
| POST | `/notifications/read-all`    | `void` |

### AI (see §6)

Exact TypeScript shapes for every model are in `src/app/core/models/`. Match the
field names 1:1 (camelCase). Pydantic can serialize snake_case with an alias
generator if your Python style differs.

---

## 6. AI agent endpoints

The frontend expects the Python side to run the actual agent (LangChain,
LlamaIndex, custom — doesn't matter). Three endpoints:

### 6.1 Chat (streaming SSE)
`POST /api/ai/chat` with header `Accept: text/event-stream`

Request body:
```json
{
  "message": "Find O- donors within 10km, urgent",
  "contextRequestId": "req-…",
  "locationHint": { "lat": 19.076, "lng": 72.8777 }
}
```

Stream frames (each `data:` line is one `AgentStreamChunk`):
```
data: {"delta": "Analyzing"}
data: {"delta": " your"}
data: {"delta": " request…"}
data: {"toolCall": {"name": "search_donors", "args": {"bloodGroup":"O-"}}}
data: {"toolResult": {"count": 3}}
data: {"delta": "Found 3 matches."}
data: {"delta": "", "done": true}
```

FastAPI sample using `sse-starlette`:
```python
from sse_starlette.sse import EventSourceResponse
import json

@app.post("/api/ai/chat")
async def ai_chat(body: AgentInput):
    async def gen():
        async for chunk in agent.stream(body):
            yield {"data": json.dumps(chunk.model_dump())}
    return EventSourceResponse(gen())
```

### 6.2 Predict availability
`POST /api/ai/predict-availability`

Request: `{ "donorId": "d-001" }`
Response `data`:
```json
{ "donorId": "d-001", "probability": 0.72,
  "windowMinutes": 60, "rationale": "Responded within 15 min on last 4 requests." }
```

### 6.3 Rank donors
`POST /api/ai/rank-donors` — same input as `/donors/search`, same output shape.
Use this when you want the *AI-enriched* ranking (with reasons authored by the
LLM) instead of the pure-math ranking under `/donors/search`.

### 6.4 Recommended agent tools
The frontend renders whatever the agent decides, but these tool names match
what our UI knows how to display nicely:
- `search_donors(bloodGroup, origin, radiusKm)` → returns `RankedDonor[]`
- `find_hospitals(origin, radiusKm, emergency24x7?)` → returns `Hospital[]`
- `check_eligibility(donorId)` → `{ eligible: bool, reason: str }`
- `predict_availability(donorId)` → `AvailabilityPrediction`
- `notify_donors(donorIds, requestId)` → `{ sent: number }`

---

## 7. WebSocket protocol

### 7.1 Notifications
`ws://…/ws/notifications?token=<accessToken>`

Server pushes each frame as JSON matching `AppNotification`:
```json
{
  "id": "n-…", "type": "emergency_alert", "severity": "critical",
  "title": "Emergency: O- needed at Tata Memorial",
  "body":  "2 units within 4 hours.",
  "createdAt": "2026-07-22T09:30:00Z", "read": false,
  "actionUrl": "/requests/req-emerg-01",
  "metadata": { "requestId": "req-emerg-01" }
}
```

FastAPI sample:
```python
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws/notifications")
async def ws_notifications(ws: WebSocket, token: str):
    user_id = verify_jwt(token)
    await ws.accept()
    async for n in notifications_stream(user_id):
        await ws.send_json(n.model_dump())
```

### 7.2 (Recommended) Donor availability
Same socket or a second one at `/ws/donors`. Frame shape:
```json
{ "type": "availability", "donorId": "d-003", "availability": "unavailable" }
```

The frontend's `RealtimeService` will need one small update once you add this —
subscribe to the `type === "availability"` messages and forward them to the
existing `availabilityUpdates$` subject. Currently the mock does this locally.

---

## 8. JWT recommendations

- **Access token** — short-lived (~15 min). Include `sub` (userId) and `role`.
- **Refresh token** — long-lived (~7 days), one-time-use if you want rotation.
- Return `expiresIn` in seconds. The frontend doesn't currently pre-refresh on
  expiry (it reacts to 401), but that's easy to add if you want.
- **Do NOT** put sensitive data in the JWT payload — the frontend can decode it.

---

## 9. Migration checklist

- [ ] CORS middleware installed with the frontend origin
- [ ] All endpoints return `ApiResult<T>` envelope
- [ ] `POST /api/auth/login` + `register` + `refresh` implemented
- [ ] Bearer auth middleware validating JWT on protected routes
- [ ] SSE endpoint at `/api/ai/chat` (works with `curl -N -H "Accept: text/event-stream"`)
- [ ] WebSocket at `/ws/notifications` accepting `token=` query param
- [ ] `environment.useMockApi` flipped to `false`
- [ ] Smoke test: register → dashboard loads → search returns → chat streams

Once these are checked, delete `src/assets/mock/*.json` and every service in
`src/app/core/services/` will silently route through the real backend.
