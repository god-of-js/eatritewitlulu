# EatriteWithLulu

Marketing site plus authenticated meal-plan checkout with Paystack, Firebase Auth, and a customer dashboard.

## Setup

```bash
npm install
```

1. Copy `.env.example` to `.env.local` and add Firebase + Paystack keys.
2. In Firebase, enable **Email/Password** under Authentication.
3. Create a **Firestore** database, publish `firebase/firestore.rules`, and set Cloudinary unsigned-upload env vars.
4. Keep `localhost` in Authentication → Settings → Authorized domains.
5. For `/admin`, publish the Firebase rules, log in at `/admin/login`, add staff from `/admin/admins`, and add meals from `/admin/menu`.
6. Start the app:

```bash
npm run dev
```

Meal-plan prices live in `lib/plans.ts`. About/FAQ copy lives in `lib/about.ts` and `lib/faq.ts`. Menu meals and customer orders are stored in Firestore.

## Scripts

```bash
npm run dev
npm run build
npm run start
```
