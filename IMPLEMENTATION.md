# TripWise traveler and agent flows

The existing landing page, authentication cards, dashboard panels, and itinerary layout are retained. The single district/place search remains. Dates and group size are collected by **Customize trip**, so the landing page does not return to a three-field search design.

## Run locally

1. Install the existing dependencies in backend and frontend with npm install.
2. Configure backend/.env using backend/.env.example. Existing .env values were not changed.
3. Set MONGO_URI and a random JWT_SECRET of at least 32 characters. The backend fails closed if the signing secret is missing or too short.
4. Run npm run dev in backend, then npm run dev in frontend.
5. Set VITE_API_URL only if the API is not at http://localhost:5000/api. FRONTEND_URL must match the frontend origin for CORS.

Node 22 or newer is recommended for built-in fetch and the installed Vite version. Production requires HTTPS and a server fallback to index.html for frontend routes.

## Traveler workflow

- Search existing destinations by district, place, or attraction. Exact matches take precedence over partial matches.
- Open a destination, select a suggested package, and choose **Customize trip**.
- Sign in or register. Email sign-in preserves the requested destination and package.
- Enter travel dates, group size, and an agent. Sending creates an **Action Required** request; it does not claim inventory is available or charge a payment.
- View your trips, select itinerary days, inspect milestones and reservations, open an agent-supplied HTTPS menu link, or message the assigned agent.
- History records signed-in destination views, packages, searches, and manually saved flight-search details. Past packages come from your actual bookings.

The destination catalog contains sample packages. There is no airline/hotel inventory integration, flight-booking engine, or payment processor. Flight search notes are explicitly labeled as planning notes, not live flight results.

## Agent workflow

- Register with the Travel Agent role. The role selector is retained; agent registration is self-service.
- **New Trip** creates a trip for an existing traveler email.
- Dashboard action buttons open the trip editor. Change status, dates, group size, package, amount, payment date, highlights, and day-by-day activities.
- Mark activities future, active, or past. Reservations can include HTTPS menu URLs.
- Clients lists only travelers with bookings assigned to the signed-in agent.
- Messages are limited to a trip's assigned traveler and agent. Recipient identity is derived on the server. Only recipients can mark messages read.
- Reports show active bookings, monthly paid revenue in USD, and clients first booked with this agent in the last 30 days.
- Revenue uses fully paid non-cancelled bookings and their recorded payment date. The dashboard is not accounting/payment-provider reconciliation.

## Updates and local information

- Bookings, itinerary and metrics refresh every 30 seconds. Messages refresh every 10 seconds. These are polling updates, not WebSocket push.
- The itinerary badge reports sync state rather than claiming GPS/activity telemetry.
- Weather uses [Open-Meteo](https://open-meteo.com/en/docs), with timestamped forecast-derived travel tips. Tips are not official emergency alerts.
- USD/LKR rates use [Frankfurter](https://frankfurter.dev/providers/cbsl/), with the provider's daily rate date shown.
- Successful local intelligence responses are cached for 10 minutes. Failed providers show unavailable instead of fabricated values.
- No precise traveler location is transmitted; the API uses fixed destination coordinates.

## Google and Apple setup

Both buttons now start an authorization-code flow. Missing credentials produce a clear message; email login remains available.

Google:
- Create a Web OAuth client and set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.
- Register BACKEND_URL/api/auth/oauth/google/callback as the redirect URI.
- See [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).

Apple:
- Configure a Sign in with Apple Services ID and set APPLE_CLIENT_ID.
- Generate an ES256 client-secret JWT using your Apple team ID, key ID and private key; set APPLE_CLIENT_SECRET and rotate it before expiry.
- Register the HTTPS web domain and BACKEND_URL/api/auth/oauth/apple/callback return URL. Apple web sign-in needs a real HTTPS domain.
- See [Sign in with Apple REST API](https://developer.apple.com/documentation/signinwithapplerestapi).

Identity tokens are checked against provider RSA keys, issuer, audience, expiry, verified email, and nonce. State and completion tickets are stored with expiration and consumed once. The completion ticket is additionally bound to the initiating tab's verifier. Google uses PKCE. Provider tokens are not returned to the frontend. Existing accounts are not silently linked by matching email: use the original sign-in method.

## Data compatibility and security

- API authentication loads the current account role from MongoDB; frontend routing is not the security boundary.
- Bookings have explicit traveler and agent ownership. Historical demo records without owners are not exposed through the new APIs.
- No real records were deleted, assigned to guessed users, or reseeded. Legacy demo itinerary data remains in the database but is not served as a user's trip.
- Passwords use bcrypt. JWTs expire after one day. Browser sign-out removes the local session; tokens already copied elsewhere remain valid until expiry.
- Sample .env files contain no secrets.

## Verification

- Run npm test in backend: HTTP integration tests with in-memory model adapters and actual Mongoose schema validation, covering role and ownership isolation, requests, itinerary edits, messaging/read receipts, history, login, validation, metrics, OAuth verification/replay protection, and provider failures.
- Run npm run lint in frontend.
- Run npm run build in frontend.

Tests do not mutate the configured database. An isolated browser fixture API can be started with node test/preview.js in backend; use frontend port 5174 and VITE_API_URL=http://127.0.0.1:5001/api. Its fictional accounts are agent@example.test and traveler@example.test, password TripWiseTest123!. It uses in-memory data only and must never be used as a production API.

Real provider OAuth sign-in still requires your Google/Apple credentials and registered domains. The MongoDB connection was checked using a read-only ping; persistent database writes were not exercised against your real database.
