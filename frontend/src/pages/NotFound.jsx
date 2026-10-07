import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="center" style={{ padding: '4rem 0' }}>
      <h1>404</h1>
      <p className="muted">This page doesn't exist.</p>
      <Link to="/" className="btn">Go home</Link>
    </section>
  );
}
