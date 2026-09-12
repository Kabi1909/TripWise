# TripWise

TripWise is a full-stack travel planning application for exploring Sri Lankan destinations and coordinating personalized trips between travelers and travel agents. The interface also uses the WiseTravel and WiseTravel Pro names.

Visitors can browse destinations before signing in. Travelers can request trips and follow their itineraries, while agents manage assigned clients, schedules, bookings, and messages.

## Features

### Public home page

- Browse Colombo, Mirissa & Galle Coast, Sigiriya Ancient Rock, and Ella Green Highlands.
- Search the destination catalog by district, place, or attraction using one search field.
- View destination information, highlights, and suggested packages.
- Open login and registration pages; authenticated visitors can access their portal or log out.
- Trip creation and other account activities require authentication.

### Traveler portal

- Register and sign in using email and password.
- Request a customized trip with a destination, package, travel dates, group size, and selected agent.
- View personal trips and day-by-day itineraries.
- Follow activity times, descriptions, and agent-maintained activity statuses.
- View upcoming itinerary reservations and optional restaurant menu links.
- Message the assigned agent and receive unread-message notifications.
- Review destination/package history, past trips, and saved flight-search planning notes.
- View destination weather and USD/LKR exchange information.
- Access account details through the email-initial icon in the header.

### Agent portal

- Register with the Travel Agent role and sign in to the agent dashboard.
- Create trips for existing registered travelers.
- Manage assigned bookings, dates, group sizes, prices, and booking statuses.
- Add and edit daily activities, milestones, reservations, and menu links.
- Communicate with assigned travelers.
- Review client lists and business reports.
- Track active bookings, monthly recorded paid revenue, and new clients over the last 30 days.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7 |
| Styling and icons | Tailwind CSS 3, Lucide React |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Authentication | JSON Web Tokens, bcryptjs |
| External information | Open-Meteo weather, Frankfurter exchange rates |
| Checks | ESLint, Vite production build, Node.js test runner |

## Project structure

~~~text
TripWise/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose data models
│   ├── routes/          # API endpoints
│   ├── services/        # Business rules and integrations
│   ├── test/            # Tests and isolated preview fixtures
│   ├── .env.example
│   ├── app.js           # Express application
│   ├── server.js        # Database connection and server startup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Pages and shared UI
│   │   ├── context/     # Authentication and notifications
│   │   ├── hooks/       # Shared hooks, including polling
│   │   ├── lib/         # Destination catalog and helpers
│   │   └── App.jsx      # Application routes and access guards
│   ├── .env.example
│   └── package.json
├── IMPLEMENTATION.md   # Additional implementation details
└── README.md
~~~

## Requirements

- Node.js 22.12 or newer and npm.
- A running local MongoDB instance or an accessible MongoDB connection URI.
- Internet access for dependency installation, remotely hosted photos, weather, and exchange-rate information.

## Local setup

### 1. Get the project

Clone your GitHub repository and open its root folder:

~~~bash
git clone <your-repository-url>
cd <repository-folder>
~~~

Replace the placeholders with your repository URL and folder name.

### 2. Install dependencies

Run these commands from the project root:

~~~bash
cd backend
npm install
cd ../frontend
npm install
cd ..
~~~

### 3. Configure environment variables

Copy backend/.env.example to backend/.env and frontend/.env.example to frontend/.env.

On Windows PowerShell, from the project root:

~~~powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
~~~

If you already have .env files, update them instead of overwriting them.

Set the backend values:

~~~dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tripwise
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters_long
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
~~~

Generate a random signing secret and use its output for JWT_SECRET:

~~~bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
~~~

Set the frontend API address:

~~~dotenv
VITE_API_URL=http://localhost:5000/api
~~~

| Variable | Purpose |
| --- | --- |
| PORT | Backend listening port |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Token-signing secret; at least 32 characters |
| FRONTEND_URL | Allowed frontend origin for CORS |
| BACKEND_URL | Public backend origin used by optional OAuth callbacks |
| VITE_API_URL | Frontend API base URL, including /api |

The example backend file also contains optional Google and Apple OAuth variables. Leave them blank for the current email/password login UI. Social sign-in buttons are not displayed.

Keep real credentials in local or deployment environment settings. Frontend VITE_ variables are included in the browser bundle and must not contain secrets.

### 4. Start the backend

In one terminal:

~~~bash
cd backend
npm run dev
~~~

The default API base URL is http://localhost:5000/api. Backend startup requires a valid signing secret and a successful MongoDB connection.

### 5. Start the frontend

In another terminal:

~~~bash
cd frontend
npm run dev
~~~

Open http://localhost:5173.

If Vite uses a different port, update FRONTEND_URL in backend/.env to match and restart the backend.

## Using the application

### Create accounts and request a trip

1. Register a Travel Agent account.
2. Log out and register a traveler account.
3. Browse a destination and choose Customize trip, or open the new-trip page.
4. Enter the trip details and select the registered agent.
5. Submit the request. New traveler requests start with Action Required.
6. Sign in as the assigned agent to review and update the booking.

Normal development uses accounts you register yourself. The separate test preview described below supplies fictional accounts.

### Add a daily schedule

Schedule editing is available to the assigned travel agent.

1. Open the agent dashboard and select the trip's three-dot edit button, or open the itinerary and select Edit.
2. Find Day-by-day schedule.
3. Select + Add activity or reservation.
4. Enter the day number, Sri Lanka time, activity title, description, and live status.
5. Mark Reservation only for a reservation and optionally supply an HTTPS restaurant menu URL.
6. Add further activities and select Save trip.

Example for a two-day Ella itinerary:

| Day | Time | Activity | Status |
| --- | --- | --- | --- |
| 1 | 09:00 | Visit Nine Arches Bridge | future |
| 1 | 13:00 | Lunch in Ella | future |
| 2 | 07:00 | Hike Little Adam's Peak | future |
| 2 | 15:00 | Visit Ravana Falls | future |

Day 1 is the trip's start date. Keep activity days within the booking's date range. Travelers select a day on the itinerary to view its activities.

Activity statuses are future, active, and past. Agents maintain these values; they do not represent automatic location tracking.

### Messages and notifications

Messages belong to a trip and are limited to its assigned traveler and agent.

- Sending a message shows the sender a success confirmation.
- Incoming unread messages appear in the recipient's notification bell.
- Opening a notification marks that message read and opens the corresponding conversation.
- Messages received while signed out remain available on the next portal visit.
- The account header shows the signed-in name and an email-initial icon; account details include the email and role.

### Payment tracking

TripWise currently records payment information manually. It does not process payments or provide an integrated checkout.

1. The agent records the total in USD and can set Pending Payment.
2. The traveler and agent arrange payment outside the application.
3. After verifying receipt, the agent records Fully paid on and updates the booking status as appropriate.

Monthly revenue is calculated from recorded fully paid, non-cancelled bookings using their payment dates. These records do not verify transactions with a bank or payment provider.

## Main frontend routes

| Route | Access / purpose |
| --- | --- |
| / | Public destination search and browsing |
| /login | Email/password login |
| /register | Account registration |
| /trips | Authenticated trip list |
| /trips/new | Authenticated trip creation/request form |
| /trips/:id | Authorized trip itinerary |
| /messages | Authenticated trip conversations |
| /history | Authenticated travel history |
| /help | Authenticated help page |
| /agent | Agent dashboard |
| /agent/new | Agent trip creation |
| /agent/clients | Agent client list |
| /agent/reports | Agent reports |

Agent credentials redirect to /agent. Traveler credentials open /trips or restore an allowed requested traveler page. Backend authorization checks account roles and booking ownership independently of frontend route guards.

## Data refresh and external services

| Information | Update behavior |
| --- | --- |
| Trips, itineraries, and metrics | Poll approximately every 30 seconds |
| Message conversations | Poll approximately every 10 seconds |
| Notification bell | Poll approximately every 5 seconds while the portal is open; refresh on window focus |
| Local weather and currency information | Successful responses cached for 10 minutes |

Updates use polling rather than WebSockets. Notifications are in-app alerts, not browser or operating-system push notifications.

Weather uses fixed destination coordinates through Open-Meteo. Weather tips are forecast-derived guidance rather than official emergency advisories. Exchange information uses Frankfurter and displays the provider's rate date; it is not a live trading quote. Provider failures show unavailable information instead of invented values.

## Checks and tests

Run backend integration tests:

~~~bash
cd backend
npm test
~~~

From the frontend directory:

~~~bash
npm run lint
npm run build
~~~

Backend tests use in-memory model adapters and Mongoose schema validation without modifying the configured database. Coverage includes authentication, role and ownership checks, booking changes, messaging, notifications, history, metrics, and selected integration failure cases.

### Optional isolated preview

For development demonstrations without connecting the preview API to MongoDB, run from backend:

~~~bash
node test/preview.js
~~~

In a second PowerShell terminal, from frontend:

~~~powershell
$env:VITE_API_URL = 'http://127.0.0.1:5001/api'
npm run dev -- --host localhost --port 5174 --strictPort
~~~

Open http://localhost:5174.

| Role | Fixture email | Fixture password |
| --- | --- | --- |
| Traveler | traveler@example.test | TripWiseTest123! |
| Travel Agent | agent@example.test | TripWiseTest123! |

These accounts exist only in the isolated preview. Data is held in memory and resets when the preview restarts. Never use this fixture API for production.

## Production build

Build the frontend:

~~~bash
cd frontend
npm run build
~~~

The generated frontend files are in frontend/dist. Set the deployment VITE_API_URL before building. Configure the frontend host to serve index.html for client-side routes.

Run the backend with its production environment variables:

~~~bash
cd backend
npm start
~~~

Use HTTPS, set FRONTEND_URL to the deployed frontend origin, and configure the production database and signing secret. Vite's npm run preview command is for checking a build locally.

## Current limitations

- Destination packages are suggestions from a fixed catalog; they do not confirm hotel, airline, or activity availability.
- Flight-search history stores planning notes, not live flight searches or bookings.
- Payments are manually recorded; no payment gateway, automatic settlement, or transaction verification is implemented.
- Agent registration is self-service; registering as an agent does not verify a travel business.
- Google and Apple sign-in buttons are removed from the current UI, although optional backend OAuth code remains.
- Photos depend on external image hosts.
- Logging out clears the browser session. Previously copied JWTs remain valid until their expiry.

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for additional behavior and optional OAuth configuration.

## Contributing

1. Create a branch for your change.
2. Keep changes focused and follow the existing component styles.
3. Run the relevant backend tests and frontend checks.
4. Open a pull request describing the change and its validation.

## License

No repository-wide LICENSE file is currently provided. The backend package metadata declares ISC; confirm the intended project license and add the corresponding LICENSE file before distributing the project under a specific license.


## Trip allocation notifications

When a traveler submits a customized trip and selects an agent, the new booking stores an unread allocation flag in the same database write. The selected agent receives a New trip request entry in the existing notification bell and an in-app toast on the next notification refresh (approximately five seconds while the portal is open).

- Only the assigned agent can see or acknowledge the allocation alert.
- Opening its bell entry marks the allocation read and opens the trip itinerary.
- The toast's View trip button opens the itinerary; the bell entry remains unread until acknowledged.
- Requests made while the agent is signed out remain unread for their next portal visit.
- Message and allocation alerts share the bell count and the latest-20 dropdown.
- Existing bookings and trips created by agents do not generate allocation alerts.
- Editing a trip or repeatedly acknowledging an alert does not generate duplicates.
- These alerts are in-app notifications, not email or operating-system push messages.

The authenticated GET /api/messages/notifications feed includes a kind field identifying message or trip-allocation entries. Allocation IDs use the allocation: prefix. Assigned agents acknowledge them using PATCH /api/bookings/:id/allocation/read. Ordinary chat message endpoints retain their existing behavior.

Verification: backend integration tests cover recipient isolation, spoofed input, unread persistence, acknowledgment permissions, repeat acknowledgments, legacy bookings, agent-created bookings, mixed-feed ordering, and total unread counts beyond the dropdown limit.
