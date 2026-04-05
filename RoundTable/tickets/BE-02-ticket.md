# BE-02 -- Backend Craftsman
**Phase:** Production Sprint
**Team:** Syndicate
**Status:** [~] IN PROGRESS
**Depends on:** None
**Blocks:** INT-09

## Scope
Fix all P0-P2 backend issues across 14 files: missing dependencies, infinite retry, server-side XLSX generation, PromptPay QR CRC16, LINE auth session creation, open redirect, payment webhook security, auth checks, pagination, env validation, dead code cleanup.

## Acceptance Criteria
- [ ] package.json has all required runtime and dev dependencies
- [ ] lib/llm.ts: max 3 retries with exponential backoff, 30s timeout, Zod validation
- [ ] lib/planner-generator.ts: no URL.createObjectURL, returns Buffer, uploads to Supabase Storage
- [ ] lib/qr-generator.ts: real CRC16/CCITT, correct Merchant City length prefix
- [ ] lib/sheet-builder.ts: no console.log (or gated behind DEBUG_MODE)
- [ ] lib/supabase/server.ts: proper error logging, env validation
- [ ] lib/supabase/client.ts: env validation with clear error
- [ ] lib/supabase/middleware.ts: dead code removed or reduced to minimal stub
- [ ] app/api/auth/line/route.ts: creates real Supabase session via Admin API
- [ ] app/api/auth/callback/route.ts: open redirect fixed
- [ ] app/api/payment/webhook/route.ts: HMAC signature verification, simulation gated, idempotency
- [ ] app/api/payment/create-qr/route.ts: crypto.randomUUID, fail on DB error
- [ ] app/api/line/share-flex/route.ts: auth check added
- [ ] app/api/blueprint/route.ts: pagination + spirit_animal validation

## Boundaries
- Do NOT touch: database schema, frontend components, quiz engine, infrastructure config
