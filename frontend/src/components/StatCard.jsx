// A small reusable component — receives data through PROPS
export default function StatCard({ icon, value, label, sdg }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sdg && <div className="stat-sdg">{sdg}</div>}
    </article>
  );
}
