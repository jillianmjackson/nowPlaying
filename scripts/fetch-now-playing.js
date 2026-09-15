const fs = require('fs');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh token: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function getCurrentlyPlaying(accessToken) {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (res.status === 204) {
    return { isPlaying: false };
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch currently playing: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  if (!data || !data.item) {
    return { isPlaying: false };
  }

  return {
    isPlaying: data.is_playing,
    title: data.item.name,
    artist: data.item.artists.map((a) => a.name).join(', '),
  };
}

async function main() {
  const accessToken = await getAccessToken();
  const nowPlaying = await getCurrentlyPlaying(accessToken);

  fs.writeFileSync('now-playing.json', JSON.stringify(nowPlaying, null, 2));
  console.log('Wrote now-playing.json:', nowPlaying);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
