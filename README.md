# TECHSLOT Resource Hub

Full-stack resource library built with React, Vite, Tailwind, Express, and MongoDB Atlas/GridFS.

## Local development

1. Install Node.js 20 or newer.
2. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`, a long random `JWT_SECRET`, `ADMIN_EMAIL`, and an `ADMIN_PASSWORD` of at least 12 characters.
3. Resource files and thumbnails are stored in the MongoDB Atlas GridFS bucket; no separate file-storage credentials are required.
4. Copy `client/.env.example` to `client/.env` if the API is not at `http://localhost:5000/api`.
5. From the project root run `npm install`, `npm install --prefix server`, `npm install --prefix client`, then `npm run dev`.
6. Open the Vite URL (normally `http://localhost:5173`). Open `/admin` to sign in with the server-configured admin account.

The server creates the admin account on first startup. Keep all `.env` files private; only the `.env.example` templates belong in source control. The supplied Atlas connection details should be entered locally in `server/.env`, not in source files or deployment config.
Quote `.env` values containing `#` or whitespace, for example `ADMIN_PASSWORD="your password"`, so dotenv does not parse the remainder as a comment.

## API and behavior

- Public resources are only visible after publishing; latest, popular, and featured endpoints return published items.
- Resource lists support `q`, `category`, `type`, `page`, and `limit`; sorting is newest first.
- Admin routes use a separate admin-role JWT. Ordinary user registration always creates a `user` role.
- `REQUIRE_LOGIN_FOR_DOWNLOADS` defaults to `false`. The admin dashboard can also enable the persisted site setting; the server enforces it for download requests.
- Uploads accept images, PDFs, and ZIP/binary files up to 25 MB and are stored in MongoDB GridFS.

## Deployment

- **Render API:** deploy `server/` as a Node web service. Build/install command: `npm install`; start command: `npm start`. Configure the server environment variables from `server/.env.example`, and set `CLIENT_URL` to the deployed frontend origin.
- **Vercel frontend:** set the project root to `client/`, build command to `npm run build`, output directory to `dist`, and configure `VITE_API_URL` to the deployed API's `/api` URL. Add a Vercel rewrite to serve `index.html` for client-side routes if SPA rewrites are not enabled automatically.
- Set Atlas network access for the deployed API and use a dedicated database user with only the required database permissions.

## Verification

Run `npm run build --prefix client` to verify the production frontend bundle. Backend files are native ES modules and can be syntax-checked with `node --check`.
