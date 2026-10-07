// DonationCard — shows one donation. The parent passes callbacks (onClaim, onPickup,
// onDelete) as props; the card only shows the buttons the current user may use.
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORY_ICON = { cooked: '🍛', raw: '🌾', packaged: '📦', bakery: '🥖', 'fruits-vegetables': '🥕' };
const STATUS_LABEL = { available: 'Available', claimed: 'Claimed', picked_up: 'Picked up', expired: 'Expired' };

// "in 3h 20m" / "expired"
function timeLeft(date) {
  const ms = new Date(date) - new Date();
  if (ms <= 0) return 'expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h left` : `${h}h ${m}m left`;
}

export default function DonationCard({ donation, onClaim, onPickup, onDelete, busy }) {
  const { user } = useAuth();
  const d = donation;
  const isOwner = user && d.donor?._id === user.id;
  const isClaimer = user && d.claimedBy?._id === user.id;
  const urgent = d.status === 'available' && new Date(d.expiresAt) - new Date() < 3 * 3600000;

  return (
    <article className={`donation-card status-${d.status}`}>
      <div className="dc-top">
        <span className="dc-icon">{CATEGORY_ICON[d.category] || '🍽️'}</span>
        <span className={`badge badge-${d.status}`}>{STATUS_LABEL[d.status]}</span>
      </div>
      <h3>{d.title}</h3>
      {d.description && <p className="muted small">{d.description}</p>}

      <ul className="dc-meta">
        <li>⚖️ <strong>{d.quantityKg} kg</strong> · ~{Math.floor(d.quantityKg / 0.4)} meals</li>
        <li>📍 {d.pickupAddress}, {d.city}</li>
        {d.status === 'available' && <li className={urgent ? 'urgent' : ''}>⏰ {timeLeft(d.expiresAt)}</li>}
        <li>🏪 {d.donor?.organization || d.donor?.name}</li>
        {d.claimedBy && <li>🤝 {d.claimedBy.organization || d.claimedBy.name}</li>}
        {/* contact details only for the two parties involved */}
        {(isOwner || isClaimer) && d.status === 'claimed' && (
          <li>📞 {isOwner ? d.claimedBy?.phone : d.donor?.phone}</li>
        )}
      </ul>

      <div className="dc-actions">
        {user?.role === 'ngo' && d.status === 'available' && onClaim && (
          <button className="btn" disabled={busy} onClick={() => onClaim(d._id)}>Claim this food</button>
        )}
        {(isOwner || isClaimer) && d.status === 'claimed' && onPickup && (
          <button className="btn" disabled={busy} onClick={() => onPickup(d._id)}>Mark picked up</button>
        )}
        {(isOwner || user?.role === 'admin') && onDelete && (
          <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => onDelete(d._id)}>Delete</button>
        )}
      </div>
    </article>
  );
}
