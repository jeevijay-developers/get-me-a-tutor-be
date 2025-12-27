# Environment variables — get-me-a-tutor-be

Essential environment variables for local development and production.

## Required (backend)
- MONGODB_URI - MongoDB connection string (e.g. `mongodb://localhost:27017/gmatdb`)
- JWT_SECRET - Strong JWT secret for signing access tokens
- TOKEN_HASH_SECRET - Secret used for hashing tokens
- EMAIL_USER - SMTP username / email
- EMAIL_PASS - SMTP password (use app-specific password or OAuth tokens for Gmail)
- EMAIL_FROM - From address for outgoing emails
- PORT - Backend port (default: 5000)
- CLIENT_URL - Frontend origin(s) allowed by CORS (comma-separated if multiple). Example: `http://localhost:5173`
- ADMIN_URL - Admin frontend origin(s) allowed by CORS (optional)
- DASHBOARD_URL - Dashboard frontend origin(s) allowed by CORS (optional)
- FRONTEND_URL - Public frontend URL used in emails for links (e.g., password resets)

## Optional / Integrations
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM - For SMS/WhatsApp
- S3_* - AWS S3 credentials if you add resume uploads
- SENTRY_DSN - Sentry DSN for error monitoring

## Security Notes
- Never commit secrets to source control
- Use strong random values for `JWT_SECRET` and `TOKEN_HASH_SECRET` in production
- Prefer app-specific passwords or OAuth for Gmail `EMAIL_PASS` in production

---

Add the above keys to your `.env` for backend and to frontend `.env.local` set `VITE_API_URL` to point at the backend base URL (without a trailing `/api` unless backend is mounted under `/api`).
