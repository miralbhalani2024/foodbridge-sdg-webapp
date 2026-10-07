// Home page — explains the SDG problem and shows LIVE impact from GET /api/stats
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null); // useState: data that, when changed, re-renders the page
  const [error, setError] = useState('');

  // useEffect: side-effect (API call) after the first render
  useEffect(() => {
    api
      .get('/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const fmt = (n) => (n ?? 0).toLocaleString('en-IN');

  return (
    <>
      <section className="hero">
        <div>
          <span className="pill">UN SDG 2 · SDG 12</span>
          <h1>Surplus food shouldn't end up in the bin.</h1>
          <p className="lead">
            Restaurants, hostels and caterers list leftover food. Nearby NGOs claim it and collect it before it
            expires. Fewer people go hungry, and less food rots in landfills.
          </p>
          <div className="hero-actions">
            <Link to="/donations" className="btn btn-lg">Find available food</Link>
            {!user && <Link to="/register" className="btn btn-outline btn-lg">Become a donor / NGO</Link>}
            {user?.role === 'donor' && <Link to="/donate" className="btn btn-outline btn-lg">Donate food</Link>}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">🍲</div>
      </section>

      <h2 className="section-title">Our live impact</h2>
      {error && <p className="alert alert-error">{error}</p>}
      <section className="stats-grid">
        <StatCard icon="🍽️" value={stats ? fmt(stats.impact.meals) : '–'} label="Meals served" sdg="SDG 2 · Zero Hunger" />
        <StatCard icon="⚖️" value={stats ? `${fmt(stats.impact.kg)} kg` : '–'} label="Food rescued" sdg="SDG 12 · Less waste" />
        <StatCard icon="🌍" value={stats ? `${fmt(stats.impact.co2SavedKg)} kg` : '–'} label="CO₂e avoided" sdg="SDG 13 · Climate" />
        <StatCard icon="✅" value={stats ? `${stats.rescueRate}%` : '–'} label="Listings rescued" />
      </section>

      {stats && (
        <section className="two-col">
          <div className="panel">
            <h3>Food rescued by category</h3>
            {stats.byCategory.length === 0 && <p className="muted">Nothing rescued yet. Be the first!</p>}
            {stats.byCategory.map((c) => {
              const max = Math.max(...stats.byCategory.map((x) => x.kg));
              return (
                <div className="bar-row" key={c.category}>
                  <span className="bar-label">{c.category.replace('-', ' & ')}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.kg / max) * 100}%` }} /></div>
                  <span className="bar-value">{c.kg} kg</span>
                </div>
              );
            })}
          </div>
          <div className="panel">
            <h3>Right now</h3>
            <ul className="now-list">
              <li><strong>{stats.status.available.count}</strong> listings waiting for an NGO</li>
              <li><strong>{stats.status.claimed.count}</strong> on their way to people</li>
              <li><strong>{stats.community.donors}</strong> donors · <strong>{stats.community.ngos}</strong> NGOs</li>
              <li><strong>{stats.status.expired.count}</strong> expired (wasted — help us bring this to zero)</li>
            </ul>
          </div>
        </section>
      )}

      <h2 className="section-title">How it works</h2>
      <section className="steps">
        <article className="step"><span>1</span><h3>Donor lists food</h3><p>Quantity, category, pickup address and expiry time.</p></article>
        <article className="step"><span>2</span><h3>NGO claims it</h3><p>Only one NGO can claim a listing, so there's no double pickup.</p></article>
        <article className="step"><span>3</span><h3>Food is collected</h3><p>Marked "picked up". The impact counters update for everyone.</p></article>
      </section>

      <section className="panel why">
        <h3>Why this matters</h3>
        <p>
          The UN estimates that roughly a billion tonnes of food are wasted every year while hundreds of millions of
          people face hunger. SDG target 12.3 aims to halve food waste by 2030. FoodBridge tackles the "last mile"
          problem: connecting a kitchen with surplus to people who need it, within the few hours the food stays fresh.
        </p>
      </section>
    </>
  );
}
