import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api';

const DEMO = [
  { label: 'Donor (hotel)', email: 'donor@foodbridge.in' },
  { label: 'NGO', email: 'ngo@foodbridge.in' },
  { label: 'Admin', email: 'admin@foodbridge.in' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page narrow">
      <h1>Login</h1>
      {error && <p className="alert alert-error">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn btn-lg" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
      </form>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>

      <div className="panel demo">
        <strong>Demo accounts</strong> <span className="muted small">(after running the seed · password: password123)</span>
        <div className="demo-btns">
          {DEMO.map((d) => (
            <button key={d.email} type="button" className="btn btn-outline btn-sm" onClick={() => { setEmail(d.email); setPassword('password123'); }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
