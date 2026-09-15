function pad(n) {
  return String(n).padStart(2, '0');
}

function updateClock() {
  const now = new Date();
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById('clock').textContent = clock;
}

async function updateNowPlaying() {
  try {
    const res = await fetch(`now-playing.json?t=${Date.now()}`);
    const data = await res.json();
    const el = document.getElementById('now-playing');

    if (data.isPlaying) {
      el.textContent = `Jillian is currently listening to "${data.title}" by ${data.artist}`;
    } else {
      el.textContent = "Jillian isn't listening to anything right now";
    }
  } catch (err) {
    // now-playing.json doesn't exist yet (before the first Action run)
    document.getElementById('now-playing').textContent = "Jillian isn't listening to anything right now";
  }
}

updateClock();
setInterval(updateClock, 1000);

updateNowPlaying();
setInterval(updateNowPlaying, 30000);
