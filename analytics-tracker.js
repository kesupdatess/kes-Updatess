// KES Analytics Tracker - SIMPLE VERSION
const SUPABASE_URL = "https://jbyctjddlbyddzavmczg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieWN0amRkbGJ5ZGR6YXZtY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzE2NzYsImV4cCI6MjA5Nzk0NzY3Nn0.klEa0-zSGbHZYA-fYiHYg4ceoL1PQ87gowGEbvVmhqU";

console.log('📊 KES Analytics loading...');

// Simple session data
const session = {
  page: window.location.pathname.split('/').pop() || 'index.html',
  referrer: document.referrer ? new URL(document.referrer).hostname : 'Direct',
  device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
  browser: /Chrome/.test(navigator.userAgent) ? 'Chrome' : /Firefox/.test(navigator.userAgent) ? 'Firefox' : /Safari/.test(navigator.userAgent) ? 'Safari' : 'Other',
  os: /Windows/.test(navigator.userAgent) ? 'Windows' : /Mac/.test(navigator.userAgent) ? 'macOS' : /Linux/.test(navigator.userAgent) ? 'Linux' : /Android/.test(navigator.userAgent) ? 'Android' : 'Other',
  screen_size: window.screen.width + 'x' + window.screen.height,
  language: navigator.language,
  scroll_depth: 0,
  active_time_seconds: 0,
  total_time_seconds: 0,
  clicks: [],
  sections_seen: [],
  search_queries: [],
  is_returning: localStorage.getItem('kes_visited') === 'true',
  theme_used: localStorage.getItem('theme') || 'light'
};

// Mark as visited
if (!session.is_returning) {
  localStorage.setItem('kes_visited', 'true');
}

// Track time
let activeSeconds = 0;
let totalSeconds = 0;
let isActive = true;

setInterval(() => {
  totalSeconds++;
  if (isActive) activeSeconds++;
}, 1000);

// Track scroll
window.addEventListener('scroll', () => {
  const scrolled = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
  if (scrolled > session.scroll_depth) session.scroll_depth = scrolled;
}, { passive: true });

// Track clicks
document.addEventListener('click', (e) => {
  const target = e.target.closest('a, button');
  if (target) {
    const label = target.textContent.trim().substring(0, 50);
    if (label) {
      session.clicks.push({ label: label, time: new Date().toISOString() });
    }
  }
});

// Save to Supabase
async function saveToSupabase() {
  session.active_time_seconds = activeSeconds;
  session.total_time_seconds = totalSeconds;
  session.timestamp = new Date().toISOString();

  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(session)
    });
    
    if (res.ok) {
      console.log('✅ Analytics saved');
    } else {
      console.error('❌ Save failed:', res.status);
    }
  } catch (e) {
    console.error('❌ Error:', e);
  }
}

// Save when leaving page
window.addEventListener('beforeunload', saveToSupabase);

// Save every 60 seconds
setInterval(saveToSupabase, 60000);

// Initial save after 5 seconds
setTimeout(saveToSupabase, 5000);

console.log('✅ KES Analytics ready!');
