import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor', organization: '', city: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page narrow">
      <h1>Join FoodBridge</h1>
      {error && <p className="alert alert-error">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <fieldset className="role-pick">
          <legend>I am a…</legend>
          <label className={form.role === 'donor' ? 'selected' : ''}>
            <input type="radio" name="role" value="donor" checked={form.role === 'donor'} onChange={handleChange} />
            🏪 Donor<small>Restaurant, hostel, caterer, household</small>
          </label>
          <label className={form.role === 'ngo' ? 'selected' : ''}>
            <input type="radio" name="role" value="ngo" checked={form.role === 'ngo'} onChange={handleChange} />
            🤝 NGO<small>Food bank, shelter, volunteer group</small>
          </label>
        </fieldset>
        <label>Your name *<input name="name" required value={form.name} onChange={handleChange} /></label>
        <label>Organization<input name="organization" value={form.organization} onChange={handleChange} /></label>
        <div className="form-row">
          <label>City *<input name="city" required value={form.city} onChange={handleChange} /></label>
          <label>Phone<input name="phone" type="tel" pattern="[0-9]{10}" title="10-digit number" value={form.phone} onChange={handleChange} /></label>
        </div>
        <label>Email *<input name="email" type="email" required value={form.email} onChange={handleChange} /></label>
        <label>Password * (min 6)<input name="password" type="password" required value={form.password} onChange={handleChange} /></label>
        <button className="btn btn-lg" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </section>
  );
}
