# Orders: recording them, and running them

Before this, an order existed in one WhatsApp thread and nowhere else. Now
every order placed on the site is written to a database the moment it is
placed, and you work through them at **/admin**.

The shop does not depend on any of it. With no database configured, checkout
behaves exactly as it always did — the order simply is not recorded. A sale is
never lost to bookkeeping.

## What you need, once

Two environment variables, in **Vercel → the project → Settings → Environment
Variables**, for Production, Preview and Development:

| Name | Where it comes from |
| --- | --- |
| `DATABASE_URL` | Set for you when you connect a Postgres database (below). |
| `ADMIN_PASSWORD` | You choose it. Eight characters minimum, or /admin stays locked. |

Redeploy after adding them.

### The database

**Storage → Create Database → Neon** is the shortest path, and it sets
`DATABASE_URL` for you. Neon's free plan needs no card: 1 GB and 100 CU-hours
per project, which is a very long way beyond what this shop will do. Pick
**Frankfurt (fra1)** — Neon has no Middle East region and Gulf traffic routes
through Europe.

You can also connect the `mla-orders` database the first MLA store already
uses: **Storage → mla-orders → Connect Project**. The two shops will not
collide, because this one writes to a table called `orders_v2` and the other
owns `orders`.

Any Postgres works — Neon, Supabase, Vercel's own. They are all the same
database behind a connection string. There is no migration step: the table is
created the first time an order arrives.

### Checking it

Open `/admin`, sign in, then place a test order on the site. It appears
immediately. Before the variables are set, `/admin` tells you which ones are
missing instead of pretending to be broken.

## Using it

**The dashboard** is `/admin`. Four figures across the top — what still needs
you, what is with the courier, what has been delivered and what it came to,
and what is confirmed but not yet paid for. Then a search box that matches a
reference, a name, a phone number or a city, status filters with a count
against each, and the orders themselves, newest first. Every row is a link.

**An order** is `/admin/<reference>`. It opens on the one thing you probably
want: a single button that moves it to whatever normally comes next — New →
Confirmed → Paid → Shipped → Delivered. Beside it:

- **Send the update** opens WhatsApp with a message already written *in the
  language that customer was reading*, carrying the status, the tracking
  number and a link to their order. Nothing is sent until you press send.
- **Packing slip** is a clean sheet to print for the box. It names every piece
  as a contemporary reproduction, because that is the paper a customs officer
  reads.
- The **tracking number**, which the customer sees on their own order page.
- **Notes**, kept as a running list with the date on each.
- The full set of statuses, for going back a step or cancelling.
- The customer's address with a one-tap copy, their number as a WhatsApp link,
  and their email.

**Download all orders as CSV** is at the foot of the dashboard, for the
bookkeeping this page is not trying to be.

Cancelled orders are kept rather than deleted: a cancelled order is a fact
about the month, not an absence.

## What the customer sees

- The order page they were sent now carries its status, when it last moved,
  and the tracking number.
- **/en/orders** (and `/ar/orders`) lists the orders that browser has placed,
  with the status of each, plus a box to look one up by reference. It is linked
  from the footer and from the confirmation after checkout.

A reference only ever returns a status, a date and a tracking number — never a
name, an address or a price. The full order is readable only from the link the
customer already has, which carries the order inside it.

## How it works

- Checkout posts to `/api/orders` and opens WhatsApp in the same gesture. The
  request uses `keepalive` so it survives the tab losing focus, and a failure
  is swallowed on purpose.
- **Only slugs and quantities are accepted for the money.** Names, prices and
  shipping are recomputed on the server from the catalogue, using the same
  rules the storefront renders with. A posted price is a number a stranger
  chose, and this figure ends up in your books.
- A repeated reference is ignored rather than overwritten, so a customer
  tapping checkout twice cannot wipe a status or a note.
- Access is one shared password in an environment variable, held in a signed,
  httpOnly cookie for twelve hours. There are no accounts and no roles. A
  short or obvious password is accepted but the page says so while you are
  signed in — this screen holds customers' addresses and the URL is public.
  Changing `ADMIN_PASSWORD` signs everyone out, because it is also the key the
  session cookie is signed with.

## Running it locally

Without `DATABASE_URL`, development writes to `.orders/orders.json`, which is
gitignored. The same fallback is refused in production, where a serverless
filesystem is wiped between requests and an order written to it would vanish
without ever failing.

```bash
ADMIN_PASSWORD=some-long-password npm run dev
```

## When you outgrow it

This is a record, not an ERP. When the bookkeeping takes longer than running
the shop, push these orders into Zoho Books or Odoo — both are strong in the
GCC and VAT-aware. Keep one source of truth: the site records, the ERP reads.
