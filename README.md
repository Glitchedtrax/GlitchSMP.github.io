# GlitchSMP Website — Discord Login

## 1. Create the Discord application
Open the Discord Developer Portal and create an application for GlitchSMP.

Under OAuth2, add this redirect URL for local testing:
`http://localhost:3000/auth/discord/callback`

When the website is deployed, also add:
`https://YOUR-DOMAIN/auth/discord/callback`

## 2. Configure the website
Copy `.env.example` to `.env`.

Put your Discord Application ID in `DISCORD_CLIENT_ID`.
Put your Discord Client Secret in `DISCORD_CLIENT_SECRET`.
Set `SESSION_SECRET` to a long random private value.

Never upload or commit `.env`.

## 3. Run it
Install Node.js 18+.

In this folder run:
`npm install`
`npm start`

Then open:
`http://localhost:3000`

Do NOT open index.html directly for Discord login; the Node server must be running.

## What the login accesses
The OAuth request only asks for Discord's `identify` scope, so the site can display the logged-in user's Discord username and avatar. It does not request server-management permissions.
