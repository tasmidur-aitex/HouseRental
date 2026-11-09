import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { propertyApi } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { ErrorBox, Field, Loader } from '../components/Ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { money, PLACEHOLDER } from '../utils/format.js';

function InquiryForm({ id }) {
  const { t } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await propertyApi.inquire(id, form);
      toast.success(res.message);
      setForm({ ...form, message: '' });
    } catch (error) {
      setErr(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card side-card" onSubmit={submit}>
      <h3>{t('interested')}</h3>
      <p className="muted">Leave your details and we will get back to you.</p>
      {err && !err.errors && <div className="alert alert-error">{err.message}</div>}
      <Field label="Name" error={err?.field('name')}><input required value={form.name} onChange={set('name')} /></Field>
      <Field label="Email" error={err?.field('email')}><input type="email" required value={form.email} onChange={set('email')} /></Field>
      <Field label="Phone" error={err?.field('phone')}><input required value={form.phone} onChange={set('phone')} /></Field>
      <Field label="Message (optional)" error={err?.field('message')}><textarea rows="3" maxLength="255" value={form.message} onChange={set('message')} /></Field>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Sending…' : t('send')}</button>
    </form>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { t } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { has, toggle } = useWishlist();
  const [active, setActive] = useState(0);
  const { data: p, loading, error } = useFetch(() => propertyApi.get(id), [id]);
  const nearby = useFetch(() => propertyApi.nearby(id), [id]);

  if (loading) return <Loader />;
  if (error) return <div className="container section"><ErrorBox error={error} /><Link to="/properties" className="btn btn-outline">Back to properties</Link></div>;

  const images = p.images.length ? p.images : [PLACEHOLDER];
  const price = p.discount_price && p.discount_price < p.price ? p.discount_price : p.price;
  const liked = has(p.id);

  const onHeart = async () => {
    if (!user) return navigate('/login', { state: { from: `/properties/${p.id}` } });
    try {
      await toggle(p.id);
      toast.success(liked ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const facts = [
    ['Bedrooms', p.bedroom], ['Bathrooms', p.bathroom], ['Kitchens', p.kitchen], ['Parking', p.parking ?? '—'],
    ['Area', p.area], ['Floor', p.floor || '—'], ['Type', p.type], ['Category', p.category],
  ];
  const osm = p.latitude && p.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${p.longitude - 0.01},${p.latitude - 0.006},${p.longitude + 0.01},${p.latitude + 0.006}&layer=mapnik&marker=${p.latitude},${p.longitude}`
    : null;

  return (
    <div className="container detail">
      <nav className="crumbs"><Link to="/">{t('home')}</Link> / <Link to="/properties">{t('properties')}</Link> / <span>{p.title}</span></nav>

      <div className="detail-grid">
        <div>
          <div className="gallery">
            <img className="gallery-main" src={images[active]} alt={p.title} onError={(e) => (e.currentTarget.src = PLACEHOLDER)} />
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((src, i) => (
                  <button key={src} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-head">
            <div>
              <div className="badges inline">
                <span className="badge badge-blue">{p.purpose}</span>
                {p.badges.hot_new && <span className="badge badge-red">New</span>}
                {p.badges.trend && <span className="badge badge-amber">Trending</span>}
                {p.badges.best_rated && <span className="badge badge-green">Top rated</span>}
              </div>
              <h1>{p.title}</h1>
              <p className="card-loc"><Icon.Pin /> {p.address}{p.subcity ? `, ${p.subcity.name}` : ''}{p.city ? `, ${p.city.name}` : ''}</p>
              <p className="muted">Property code: {p.code}</p>
            </div>
            <div className="detail-price">
              <div className="price big">{money(price)}<small>{t('perMonth')}</small></div>
              {price !== p.price && <s className="old-price">{money(p.price)}</s>}
              {p.service_charge ? <p className="muted">Service charge {money(p.service_charge)}</p> : null}
              <button className={`btn ${liked ? 'btn-primary' : 'btn-outline'}`} onClick={onHeart}>
                <Icon.Heart filled={liked} /> {liked ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <div className="facts-grid">
            {facts.map(([k, v]) => (<div key={k}><span>{k}</span><strong>{v}</strong></div>))}
          </div>

          <section className="block">
            <h2>{t('details')}</h2>
            <p className="prose">{p.details}</p>
          </section>

          {(osm || p.map_link || p.video) && (
            <section className="block">
              <h2>{t('location')}</h2>
              {osm && <iframe className="map" title="Map" src={osm} loading="lazy" />}
              <div className="link-row">
                {p.map_link && <a className="btn btn-outline btn-sm" href={p.map_link} target="_blank" rel="noreferrer">Open in Google Maps</a>}
                {p.video && <a className="btn btn-outline btn-sm" href={p.video} target="_blank" rel="noreferrer">Watch video tour</a>}
              </div>
            </section>
          )}
        </div>

        <aside><InquiryForm id={p.id} /></aside>
      </div>

      {nearby.data?.length > 0 && (
        <section className="section">
          <h2>{t('nearby')}</h2>
          <div className="grid grid-3">{nearby.data.map((n) => <PropertyCard key={n.id} p={n} />)}</div>
        </section>
      )}
    </div>
  );
}
