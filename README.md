# EatriteWithLulu

Marketing site plus authenticated meal-plan checkout with Paystack, Firebase Auth, and a customer dashboard.

## Setup

```bash
npm install
```

1. Copy `.env.example` to `.env.local` and add Firebase + Paystack keys.
2. In Firebase, enable **Email/Password** under Authentication.
3. Create a **Firestore** database, then publish the rules in `firebase/firestore.rules`.
4. Keep `localhost` in Authentication → Settings → Authorized domains.
5. For `/admin`, publish `firebase/firestore.rules`, log in at `/admin/login`, then add more admins from `/admin/admins`.
6. Start the app:

```bash
npm run dev
```

Meal-plan prices live in `lib/plans.ts`. About/FAQ copy lives in `lib/about.ts` and `lib/faq.ts`.

## Scripts

```bash
npm run dev
npm run build
npm run start
```
