require('dotenv').config();
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.SESSION_SECRET) {
  console.error('Missing DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, or SESSION_SECRET in .env');
  process.exit(1);
}

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.get('/auth/discord', (req, res) => {
  const state = crypto.randomBytes(24).toString('hex');
  req.session.oauthState = state;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: 'code',
    redirect_uri: `${BASE_URL}/auth/discord/callback`,
    scope: 'identify',
    state
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

app.get('/auth/discord/callback', async (req, res) => {
  try {
    if (!req.query.code || !req.query.state || req.query.state !== req.session.oauthState) {
      return res.status(400).send('Invalid Discord login request.');
    }
    delete req.session.oauthState;

    const body = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: `${BASE_URL}/auth/discord/callback`
    });

    const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body
    });

    if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error("Discord token error:", tokenRes.status, errorText);
    throw new Error("Token exchange failed");
    }

    const token = await tokenRes.json();
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {Authorization: `Bearer ${token.access_token}`}
    });
    if (!userRes.ok) throw new Error('User lookup failed');
    const user = await userRes.json();

    req.session.user = {
      id: user.id,
      username: user.username,
      global_name: user.global_name,
      avatar: user.avatar,
      avatar_url: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : null
    };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Discord login failed. Please try again.');
  }
});

app.get('/api/me', (req, res) => res.json({user: req.session.user || null}));

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.use(express.static(path.join(__dirname)));
app.listen(PORT, () => console.log(`GlitchSMP website running at ${BASE_URL}`));
