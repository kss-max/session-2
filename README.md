## Project: assign

This is a small Express + Mongoose project for managing event bookings.

Contents
- `index.js` — main Express server and route handlers
- `db.js` — MongoDB connection helper (Mongoose)
- `models/event.js` — Mongoose schema/model for events
- `.env` — environment variables (example provided)

Prerequisites
- Node.js (v16+ recommended)
- npm (or yarn)
- A running MongoDB instance (local or remote)

Quick setup

1. Install dependencies

```powershell
npm install
```

2. Add environment variables

Create a `.env` file in the project root (an example is included). At minimum set:

```properties
PORT=5000
MONGO_URL=mongodb://localhost:27017/event
```

3. Start the server

```powershell
node index.js
# or if you want to use nodemon (install globally or as a dev-dependency):
nodemon index.js
```

By default the server tries to connect to MongoDB using the `MONGO_URL` from `.env`.

API Endpoints

- GET /api/bookings
  - Returns all events stored in the database.

- POST /api/bookings
  - Create a new booking. Send JSON in the request body matching the schema.

- GET /api/bookings/:id
  - Returns a single booking by id.

- GET /api/bookings/:email (current code)
  - NOTE: the existing code uses a route param that collides with the `/:id` route and relies on an in-memory `events` array. See the "Recommended fixes" section below for a safer route and implementation that queries MongoDB.

- DELETE /api/bookings/:id
  - Deletes an item from the in-memory `events` array in the current code (not the database). See fixes below.

Query by email (recommended)

To fetch bookings for a specific email using Mongoose, use the model query methods.

Example: return all events for an email

```javascript
// in a route handler
import Event from './models/event.js';

app.get('/api/bookings/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const events = await Event.find({ email });
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'no events found for this email' });
    }
    return res.status(200).json({ message: 'events found', eventDetails: events });
  } catch (err) {
    return res.status(500).json({ message: 'internal server error', error: err.message });
  }
});
```

Or to fetch a single document:

```javascript
const user = await Event.findOne({ email: 'alice@example.com' });
```

Recommended fixes (bugs and improvements)

1) Schema types in `models/event.js`

Current code uses lowercase `string` in the schema. Mongoose expects the JavaScript constructor `String` (capital S). Update the schema like this:

```javascript
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  event: { type: String, required: true },
  ticketType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

2) `db.js` export / `index.js` import mismatch

`db.js` currently exports a default `connectDB`. In `index.js` the file imports it as a named import. Make them consistent. EITHER:

- Change `db.js` to export a named function:

```javascript
export const connectDB = async () => { ... };
```

OR

- Change `index.js` to import the default:

```javascript
import connectDB from './db.js';
```

3) Route param collision and in-memory arrays

There are several routes using `/:id` and `/:email` which will conflict. Use a distinct route path for email queries, e.g. `/api/bookings/by-email/:email` or use query parameters: `/api/bookings?email=...`.

Also several handlers (delete, some get-by-email) use an in-memory `events` array rather than the database. Replace those with Mongoose calls (e.g., `Event.findById`, `Event.findByIdAndDelete`, etc.).

4) `findById` usage

Current code parses route id with `parseInt` which makes sense for numeric IDs but not for MongoDB ObjectId. If you use MongoDB ObjectIds, pass the string `req.params.id` directly to `Event.findById(id)`.

5) Add an index on the `email` field if you'll query by email often:

```javascript
eventSchema.index({ email: 1 });
```

Sample requests (PowerShell / curl replacement)

Get all bookings:

```powershell
curl http://localhost:5000/api/bookings
```

Create a booking (example body):

```powershell
curl -Method POST http://localhost:5000/api/bookings -Body (@{
  name = 'Alice'
  email = 'alice@example.com'
  event = 'frontend face-off'
  ticketType = 'general'
} | ConvertTo-Json) -ContentType 'application/json'
```

Get by email (after applying recommended route change):

```powershell
curl http://localhost:5000/api/bookings/by-email/alice%40example.com
```

Notes & next steps I can help with

- I can patch the project to apply the schema/import/route fixes described above.
- I can add a `getEventsByEmail(email)` helper to `db.js` or a new `services/` file and add basic tests.
- I can add example data seeding and a Postman collection.

If you want me to apply the fixes now, tell me which ones and I'll make the edits and run a quick sanity check.

---
Generated on: October 30, 2025
