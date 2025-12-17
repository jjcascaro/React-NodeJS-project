const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
const IPINFO_TOKEN = process.env.REACT_APP_IPINFO_TOKEN || '';

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Invalid credentials');
  }
  return res.json();
}

export async function fetchGeo() {
  const url = `https://ipinfo.io/geo${IPINFO_TOKEN ? `?token=${IPINFO_TOKEN}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch geo');
  return res.json();
}

export async function fetchGeoByIp(ip) {
  const url = `https://ipinfo.io/${encodeURIComponent(ip)}/geo${IPINFO_TOKEN ? `?token=${IPINFO_TOKEN}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch geo by ip');
  return res.json();
}

export function isValidIp(ip) {
  const ipv4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4.test(ip) || ipv6.test(ip);
}
