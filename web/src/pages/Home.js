import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGeo, fetchGeoByIp, isValidIp } from '../services/api';

export default function Home() {
  const [geo, setGeo] = useState(null);
  const [ipInput, setIpInput] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('search_history') || '[]'); } catch { return []; }
  });
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch { return {}; }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setError('');
        const g = await fetchGeo();
        setGeo(g);
      } catch (e) {
        setError('Failed to load geolocation.');
      }
    })();
  }, []);

  const handleSearch = async () => {
    setError('');
    const ip = ipInput.trim();
    if (!isValidIp(ip)) {
      setError('Please enter a valid IPv4 or IPv6 address.');
      return;
    }
    try {
      const g = await fetchGeoByIp(ip);
      setGeo(g);
      const newHistory = [{ ip, date: new Date().toISOString() }, ...history.filter(h => h.ip !== ip)];
      setHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    } catch (e) {
      setError('Failed to fetch IP geolocation.');
    }
  };

  const handleClear = async () => {
    setIpInput('');
    setSelected([]);
    try {
      const g = await fetchGeo();
      setGeo(g);
    } catch (e) {
      setError('Failed to load geolocation.');
    }
  };

  const toggleSelect = (ip) => {
    setSelected(prev => prev.includes(ip) ? prev.filter(i => i !== ip) : [...prev, ip]);
  };

  const deleteSelected = () => {
    const remaining = history.filter(h => !selected.includes(h.ip));
    setHistory(remaining);
    setSelected([]);
    localStorage.setItem('search_history', JSON.stringify(remaining));
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="container">
      <div className="toolbar">
        <h2>Home</h2>
        <button className="button" onClick={logout}>Logout</button>
      </div>
      <div className="muted">Signed in as {user?.email}</div>

      <div className="grid grid-2-1">
        <div>
          <div className="panel">
            <h3>Current Geolocation</h3>
            {error && <div className="error">{error}</div>}
            {geo ? (
              <div>
                <div><strong>IP:</strong> {geo.ip}</div>
                <div><strong>City:</strong> {geo.city}</div>
                <div><strong>Region:</strong> {geo.region}</div>
                <div><strong>Country:</strong> {geo.country}</div>
                <div><strong>Loc:</strong> {geo.loc}</div>
                <div><strong>Org:</strong> {geo.org}</div>
                <div><strong>Timezone:</strong> {geo.timezone}</div>
              </div>
            ) : (
              <div>Loading…</div>
            )}
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <h3>Search IP</h3>
            <div className="row">
              <input
                className="input input-grow"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="Enter IP address"
              />
              <button className="button button-primary" onClick={handleSearch}>Search</button>
              <button className="button" onClick={handleClear}>Clear</button>
            </div>
          </div>
        </div>
        <div>
          <div className="panel">
            <h3>History</h3>
            {history.length === 0 && <div className="muted">No searches yet.</div>}
            {history.map(h => (
              <div key={h.ip} className="history-item">
                <input type="checkbox" checked={selected.includes(h.ip)} onChange={() => toggleSelect(h.ip)} />
                <button className="link" onClick={async () => {
                  try {
                    const g = await fetchGeoByIp(h.ip);
                    setGeo(g);
                  } catch {}
                }}>{h.ip}</button>
                <span className="history-date">{new Date(h.date).toLocaleString()}</span>
              </div>
            ))}
            {history.length > 0 && (
              <button className="button" onClick={deleteSelected} style={{ marginTop: 8 }} disabled={selected.length === 0}>Delete Selected</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
