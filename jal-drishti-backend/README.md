# Jal-Drishti Backend (SIH26015)

## Setup
1. Create a PostgreSQL database named `jaldrishti`.
2. Run the SQL commands in `database.sql` to create tables and seed data.
3. Rename `.env.example` to `.env` and enter your database password.
4. Run `npm install`
5. Run `npm run dev` to start the server on Port 5000.

## API Endpoints
* `GET /api/dashboard/stats` - Fetch aggregate stats for the dashboard.
* `GET /api/interventions` - Fetch all watershed interventions for the map.
* `POST /api/upload` - Ingest geo-tagged field images (Multipart form data).
