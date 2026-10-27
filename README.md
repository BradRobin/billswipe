# BillSwipe – clickable prototype

A front-end-only prototype of BillSwipe: people upload real bills, verified payers swipe right to pay them.
No backend, no real payments — all data is demo data in `src/data.js` and resets on reload.

## What it shows

**Paying side**
- Card feed of bills; drag right to pay, left to skip (or use the buttons)
- Pay sheet: full balance or partial chip-in, M-Pesa (STK push) or card (3-D Secure), anonymous toggle
- Simulated payment approval, confirmation, and paid history

**Uploading side**
- My bills list with statuses (In review, Partly funded, Paid, Expired)
- Upload form: invoice photo (auto-redaction shown), amount, title, category, who gets paid, note
- Daily upload limit and review step before a bill goes live

**Design decisions built in**
- Money goes straight to the biller's paybill/till, never via BillSwipe or the uploader
- Partial payments supported
- Bill images redacted before payers see them
- Every bill reviewed before going live

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Go to vercel.com → **Add New… → Project**
2. Import this GitHub repo
3. Vercel detects Vite automatically (build: `npm run build`, output: `dist`) → **Deploy**

Every push to `main` redeploys automatically.

## Stack

Vite + React 18. One screen component (`src/App.jsx`), styles in `src/styles.css`, demo data in `src/data.js`.
