# ⚡ ThreatCrush

**Crush Every Threat Before It Crushes You.**

Real-time threat intelligence platform with threat feeds, vulnerability tracking, attack surface monitoring, and threat actor intelligence.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (Postgres)
- **Payments:** Stripe (card) + CoinPayPortal (crypto)
- **Package Manager:** pnpm

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase, Stripe, and CoinPayPortal credentials

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── waitlist/
│   │       └── route.ts      # Waitlist signup API
│   ├── globals.css            # Global styles + custom CSS
│   ├── layout.tsx             # Root layout with metadata
│   └── page.tsx               # Landing page
├── components/
│   ├── ScrollReveal.tsx       # Scroll-triggered fade-in animation
│   └── WaitlistModal.tsx      # Email + payment method modal
supabase/
└── migrations/
    └── 001_waitlist.sql       # Waitlist table migration
```

## Database Setup

Run the migration in your Supabase SQL editor or via CLI:

```bash
supabase db push
```

The `waitlist` table stores:
- `email` — unique email address
- `paid` — whether payment is confirmed
- `payment_method` — `stripe` or `crypto`
- `stripe_session_id` / `coinpay_invoice_id` — payment references
- `created_at` / `updated_at` — timestamps

## Waitlist API

### `POST /api/waitlist`

```json
{
  "email": "user@example.com",
  "payment_method": "stripe"
}
```

Returns `{ success: true, message: "..." }` on success.

## TODO

- [ ] Connect Supabase client
- [ ] Implement Stripe Checkout flow
- [ ] Implement CoinPayPortal payment flow
- [ ] Add webhook handlers for payment confirmation
- [ ] Email confirmation flow
- [ ] Admin dashboard for waitlist management

## License

Proprietary. All rights reserved.
