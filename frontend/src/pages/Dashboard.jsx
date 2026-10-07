// Dashboard — role-based: donors see what they listed, NGOs see what they claimed.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import DonationCard from '../components/DonationCard.jsx';
import StatCard from '../components/StatCard.jsx';

const TABS = ['all', 'available', 'claimed', 'picked_up', 'expired'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ donations: [], impact: { kg: 0, meals: 0, co2SavedKg: 0 } });
  const [tab, setTab] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get('/donations/mine')
      .then((res) => setData(res.data))
      .catch((err) => setMessage({ type: 'error', text: errorMessage(err) }));

  useEffect(() => {
    load();
  }, []);

  const runAction = async (fn, text) => {
    setBusy(true);
    try {
      await fn();
      setMessage({ type: 'success', text });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const pickup = (id) => runAction(() => api.patch(`/donations/${id}/pickup`), 'Marked as picked up. Thank you! 🎉');
  const remove = (id) => window.confirm('Delete this listing?') && runAction(() => api.delete(`/donations/${id}`), 'Deleted.');

  const isNgo = user.role === 'ngo';
  const visible = tab === 'all' ? data.donations : data.donations.filter((d) => d.status === tab);
  const count = (s) => data.donations.filter((d) => d.status === s).length;

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">{user.organization || ''} {user.city ? `· ${user.city}` : ''} · {isNgo ? 'Your claimed pickups' : 'Your food listings'}</p>
        </div>
        {user.role === 'donor' && <Link to="/donate" className="btn">+ New donation</Link>}
        {isNgo && <Link to="/donations" className="btn">Find food to claim</Link>}
      </div>

      <section className="stats-grid">
        <StatCard icon="🍽️" value={data.impact.meals} label={isNgo ? 'Meals you distributed' : 'Meals you donated'} />
        <StatCard icon="⚖️" value={`${data.impact.kg} kg`} label="Food rescued" />
        <StatCard icon="🌍" value={`${data.impact.co2SavedKg} kg`} label="CO₂e avoided" />
        <StatCard icon="⏳" value={count('claimed')} label={isNgo ? 'Pending pickups' : 'Awaiting pickup'} />
      </section>

      {message.text && <p className={`alert alert-${message.type}`}>{message.text}</p>}

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.replace('_', ' ')} ({t === 'all' ? data.donations.length : count(t)})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="center muted">Nothing here yet.</p>
      ) : (
        <section className="card-grid">
          {visible.map((d) => (
            <DonationCard key={d._id} donation={d} busy={busy} onPickup={pickup} onDelete={user.role !== 'ngo' ? remove : undefined} />
          ))}
        </section>
      )}
    </>
  );
}
