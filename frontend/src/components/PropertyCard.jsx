import { Link } from 'react-router-dom';
import { Icon } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { money, PLACEHOLDER } from '../utils/format.js';

export default function PropertyCard({ p }) {
  const { t } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const { has, toggle } = useWishlist();
  const compare = useCompare();
  const liked = has(p.id);
  const comparing = compare.has(p.id);
  const price = p.discount_price && p.discount_price < p.price ? p.discount_price : p.price;
  const hasDiscount = price !== p.price;

  const onHeart = async (e) => {
    e.preventDefault();
    if (!user) return toast.info('Please log in to save properties');
    try {
      await toggle(p.id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onCompare = (e) => {
    e.preventDefault();
    if (!compare.toggle(p.id)) toast.info('You can compare up to 3 properties');
  };

  return (
    <Link to={`/properties/${p.id}`} className="card property-card">
      <div className="card-img">
        <img src={p.thumbnail || PLACEHOLDER} alt={p.title} loading="lazy" onError={(e) => (e.currentTarget.src = PLACEHOLDER)} />
        <div className="badges">
          {p.badges.hot_new && <span className="badge badge-red">New</span>}
          {p.badges.trend && <span className="badge badge-amber">Trending</span>}
          {p.badges.best_rated && <span className="badge badge-green">Top rated</span>}
        </div>
        <span className="chip-purpose">{p.purpose}</span>
        <button className={`compare-btn ${comparing ? 'on' : ''}`} onClick={onCompare} aria-label="Compare property">{comparing ? '✓ Compare' : '+ Compare'}</button>
        <button className={`heart ${liked ? 'liked' : ''}`} onClick={onHeart} aria-label="Save property">
          <Icon.Heart filled={liked} />
        </button>
      </div>
      <div className="card-body">
        <div className="price-row">
          <span className="price">{money(price)}<small>{t('perMonth')}</small></span>
          {hasDiscount && <s className="old-price">{money(p.price)}</s>}
        </div>
        <h3 className="card-title">{p.title}</h3>
        <p className="card-loc"><Icon.Pin /> {p.address}{p.city ? `, ${p.city.name}` : ''}</p>
        <div className="facts">
          <span><Icon.Bed /> {p.bedroom} {t('bed')}</span>
          <span><Icon.Bath /> {p.bathroom} {t('bath')}</span>
          <span><Icon.Area /> {p.area}</span>
        </div>
      </div>
    </Link>
  );
}
