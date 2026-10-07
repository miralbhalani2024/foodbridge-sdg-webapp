// AddDonation page — a CONTROLLED FORM: every input's value lives in React state.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

// value for <input type="datetime-local"> = local time "YYYY-MM-DDTHH:mm"
const localDateTime = (hoursAhead) => {
  const d = new Date(Date.now() + hoursAhead * 3600000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function AddDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'cooked',
    quantityKg: '',
    expiresAt: localDateTime(4),
    pickupAddress: '',
    city: user?.city || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setError('');

    // client-side validation (backend validates again — never trust the client)
    if (Number(form.quantityKg) < 0.5) return setError('Quantity must be at least 0.5 kg');
    if (new Date(form.expiresAt) <= new Date()) return setError('Expiry time must be in the future');

    setSaving(true);
    try {
      await api.post('/donations', {
        ...form,
        quantityKg: Number(form.quantityKg),
        expiresAt: new Date(form.expiresAt).toISOString(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="form-page">
      <h1>Donate surplus food</h1>
      <p className="muted">List it in under a minute. Nearby NGOs will see it right away.</p>
      {error && <p className="alert alert-error">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <label>
          What food is it? *
          <input name="title" required maxLength={100} placeholder="e.g. Veg pulao from lunch buffet" value={form.title} onChange={handleChange} />
        </label>
        <label>
          Details
          <textarea name="description" rows={3} maxLength={500} placeholder="Packing, veg/non-veg, allergens…" value={form.description} onChange={handleChange} />
        </label>
        <div className="form-row">
          <label>
            Category *
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="cooked">Cooked meals</option>
              <option value="raw">Raw (grains, flour)</option>
              <option value="packaged">Packaged</option>
              <option value="bakery">Bakery</option>
              <option value="fruits-vegetables">Fruits &amp; vegetables</option>
            </select>
          </label>
          <label>
            Quantity (kg) *
            <input name="quantityKg" type="number" min="0.5" step="0.5" required value={form.quantityKg} onChange={handleChange} />
            {form.quantityKg > 0 && <small className="muted">≈ {Math.floor(form.quantityKg / 0.4)} meals</small>}
          </label>
        </div>
        <label>
          Must be picked up before *
          <input name="expiresAt" type="datetime-local" required value={form.expiresAt} onChange={handleChange} />
        </label>
        <div className="form-row">
          <label>
            Pickup address *
            <input name="pickupAddress" required value={form.pickupAddress} onChange={handleChange} />
          </label>
          <label>
            City *
            <input name="city" required value={form.city} onChange={handleChange} />
          </label>
        </div>
        <button className="btn btn-lg" disabled={saving}>{saving ? 'Posting…' : 'Post donation'}</button>
      </form>
    </section>
  );
}
