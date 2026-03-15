# ZenPlanner — API Routes + LINE LIFF Spec (SSOT)

> All API routes, auth patterns, and LINE LIFF integration specs for the API_ROUTES + LIFF_INTEGRATION agents.

---

## LLM API (Pollinations.ai)

```typescript
// lib/llm.ts — Single function, all agents use this
const ENDPOINT = "https://text.pollinations.ai/openai/chat/completions";

export async function callLLM(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  maxTokens = 4096
): Promise<string> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      max_tokens: maxTokens,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });
  if (!response.ok) {
    if (response.status >= 500) {
      // Retry once on 5xx
      await new Promise(r => setTimeout(r, 1000));
      return callLLM(systemPrompt, messages, maxTokens);
    }
    throw new Error(`LLM error ${response.status}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}
```

---

## API Routes

### Auth

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/api/auth/callback` | Supabase OAuth callback | No |
| POST | `/api/auth/line` | LINE LIFF auth bridge | No |

**LINE Auth Bridge (`/api/auth/line`)**:
```
1. Receive: { lineAccessToken: string }
2. Verify: GET https://api.line.me/v2/profile (Authorization: Bearer <token>)
3. Get: { userId, displayName, pictureUrl }
4. Find existing profile by line_user_id OR create new Supabase user
5. Return: { supabaseToken, user }
```

### Quiz

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/quiz/step` | Send message → get AI reply (animal quiz) | Yes |
| POST | `/api/quiz/profile` | Send message → get AI reply (profiling) | Yes |
| POST | `/api/quiz/complete` | Finalize quiz, save to DB | Yes |

**Quiz Step Request**:
```typescript
{ sessionId: string; message: string; mode: 'minigame' | 'custom' }
```
**Quiz Step Response**:
```typescript
{ reply: string; isComplete: boolean; axisScores?: AxisScore; spiritAnimal?: string }
```

### Blueprint

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/blueprint/generate` | Generate blueprint from quiz results | Yes |
| PUT | `/api/blueprint/update` | Update tool selection or customization | Yes |

### Planner

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/planner/generate` | Start generation job | Yes + Payment |
| GET | `/api/planner/status/[id]` | Poll generation progress | Yes |
| GET | `/api/planner/download/[id]` | Download generated planner | Yes |

### Payment

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/payment/create-session` | Create Stripe Checkout session | Yes |
| POST | `/api/payment/webhook` | Stripe webhook handler | No (signature check) |

### LINE

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/line/webhook` | LINE Messaging API webhook | No (signature verify) |
| POST | `/api/line/share-flex` | Generate Flex Message JSON for sharing | Yes |

---

## Standard Route Pattern

```typescript
// Every route follows this pattern
export async function POST(req: Request) {
  // 1. Auth check (except webhooks)
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Validate body
  const body = await req.json();
  if (!body.requiredField) return Response.json({ error: 'Bad request' }, { status: 400 });

  // 3. Business logic — ONLY via lib/ functions
  const result = await someLibFunction(body);

  // 4. Return
  return Response.json(result);
}
```

---

## LINE LIFF Integration

### Setup (`lib/liff.ts`)

```typescript
import liff from '@line/liff';

export async function initLiff(): Promise<void> {
  await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
}

export function isInLineApp(): boolean {
  return liff.isInClient();
}

export async function getLiffProfile() {
  if (!liff.isLoggedIn()) await liff.login();
  return liff.getProfile(); // { userId, displayName, pictureUrl, statusMessage }
}

export function getOS(): 'ios' | 'android' | 'web' {
  return liff.getOS();
}

export async function shareAnimalResult(animal: string, nameTh: string, quote: string, accent: string) {
  // Uses Flex Message template from archetypes.md
  await liff.shareTargetPicker([{
    type: 'flex',
    altText: `ฉันคือ ${nameTh}! — ZenPlanner`,
    contents: buildFlexMessage({ animal, nameTh, quote, accent })
  }]);
}

export function openExternal(url: string) {
  liff.openWindow({ url, external: true });
}

export function closeLiff() {
  liff.closeWindow();
}
```

### LIFF Provider (`components/liff/liff-provider.tsx`)

```typescript
// Context provides: { isReady, isInLine, profile, isLoggedIn }
// - Auto-initializes on mount
// - Handles errors gracefully (works without LIFF in dev/desktop)
// - Bridges LINE auth to Supabase on first load via /api/auth/line
// - Uses sessionStorage (not localStorage) for LINE in-app browser compat
```

### LINE Webhook Signature Verification

```typescript
// app/api/line/webhook/route.ts
import crypto from 'crypto';

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest('base64');
  return hash === signature;
}
```

---

## Supabase Client Files

```
lib/supabase/client.ts  — Browser client (createBrowserClient)
lib/supabase/server.ts  — Server client (createServerClient) for RSC + API routes
lib/supabase/middleware.ts — Middleware client for session refresh
```
