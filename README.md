# Codex Playground Auth Demo

A small Angular app with registration, sign-in, and a protected dashboard. It is designed as a safe local project for practicing changes and end-to-end testing with Codex.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200). Create an account on the registration page, sign in, and use **Sign out** to test the protected dashboard redirect.

This is a browser-only demo, not production authentication. It stores account records in local storage using salted password hashes and keeps the sign-in session in session storage. Do not use a real password or deploy this as an authentication system.

## Tests

Run Angular unit tests:

```bash
npm test
```

Run the browser end-to-end tests:

```bash
npm run e2e
```

The Playwright tests start the Angular development server automatically and cover registration, sign-in, sign-out, and protected-route behavior.
