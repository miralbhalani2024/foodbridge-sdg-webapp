// Donations page — browse + filter listings (GET with query params), NGOs can claim (PATCH)
import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import DonationCard from '../components/DonationCard.jsx';

const CATEGORIES = ['cooked', 'raw', 'packaged', 'bakery', 'fruits-vegetables'];

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [filters, setFilters] = useState({ status: 'available', city: '', category: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = async () => {
    setLoading(true);
    try {
      // axios turns params into ?status=available&city=...
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.get('/donations', { params });
      setDonations(res.data.donations);
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  // Re-load whenever a filter changes (dependency array = [filters])
  useEffect(() => {
    const t = setTimeout(load, 300); // small delay so we don't call the API on every keystroke
    return () => clearTimeout(t);   // cleanup function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const runAction = async (fn, successText) => {
    setBusy(true);
    setMessage({ type: '', text: '' });
    try {
      await fn();
      setMessage({ type: 'success', text: successText });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const claim = (id) => runAction(() => api.patch(`/donations/${id}/claim`), 'Claimed! The donor\'s phone number is now on the card and in your dashboard.');
  const pickup = (id) => runAction(() => api.patch(`/donations/${id}/pickup`), 'Marked as picked up. Food rescued! 🎉');
  const remove = (id) => {
    if (window.confirm('Delete this listing?')) runAction(() => api.delete(`/donations/${id}`), 'Listing deleted.');
  };

  return (
    <>
      <h1>Find food</h1>
      <p className="muted">Surplus food listed by donors near you. NGOs can claim a listing and collect it.</p>

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <input name="search" placeholder="Search e.g. rice, bread…" value={filters.search} onChange={handleChange} />
        <input name="city" placeholder="City" value={filters.city} onChange={handleChange} />
        <select name="category" value={filters.category} onChange={handleChange}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="available">Available</option>
          <option value="claimed">Claimed</option>
          <option value="picked_up">Picked up</option>
          <option value="expired">Expired</option>
          <option value="">All</option>
        </select>
      </form>

      {message.text && <p className={`alert alert-${message.type}`}>{message.text}</p>}

      {loading ? (
        <p className="center muted">Loading…</p>
      ) : donations.length === 0 ? (
        <p className="center muted">No listings match these filters.</p>
      ) : (
        <section className="card-grid">
          {/* .map() renders one card per donation; "key" helps React track list items */}
          {donations.map((d) => (
            <DonationCard key={d._id} donation={d} busy={busy} onClaim={claim} onPickup={pickup} onDelete={remove} />
          ))}
        </section>
      )}
    </>
  );
}
