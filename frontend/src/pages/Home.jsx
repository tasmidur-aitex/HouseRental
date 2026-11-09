import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contentApi, placesApi, propertyApi } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { useLang } from '../context/LangContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { Loader, SectionHead } from '../components/Ui.jsx';
import { Icon } from '../components/Icons.jsx';
import HeroArt from '../components/HeroArt.jsx';
import RecentlyViewed from '../components/RecentlyViewed.jsx';
import { CATEGORIES } from './Discover.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

function PropertyRow({ title, query }) {
  const { t } = useLang();
  const { data, loading } = useFetch(() => propertyApi.list({ per_page: 4, ...query }), [JSON.stringify(query)]);
  if (!loading && (!data || data.length === 0)) return null;
  const qs = new URLSearchParams(query).toString();

  return (
    <section className="section">
      <div className="container">
        <SectionHead title={title} to={`/properties?${qs}`} linkLabel={t('viewAll')} />
        {loading ? <Loader /> : <div className="grid grid-4">{data.map((p) => <PropertyCard key={p.id} p={p} />)}</div>}
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLang();
  usePageMeta('Find your next home', 'Find verified homes, flats, offices and shops for rent. Search, save, compare and book a visit.');
  const navigate = useNavigate();
  const toast = useToast();
  const [subId, setSubId] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cityId, setCityId] = useState('');
  const [email, setEmail] = useState('');
  const cities = useFetch(() => placesApi.cities({ with_subcities: 1 }), []);
  const areas = cities.data?.find((c) => String(c.id) === String(cityId))?.subcities || [];
  const reviews = useFetch(() => contentApi.reviews(), []);
  const settings = useFetch(() => contentApi.settings(), []);

  const onSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (cityId) p.set('city_id', cityId);
    if (subId) p.set('subcity_id', subId);
    if (category) p.set('category', category);
    if (maxPrice) p.set('max_price', maxPrice);
    navigate(`/properties?${p.toString()}`);
  };

  const onSubscribe = async (e) => {
    e.preventDefault();
    try {
      await contentApi.subscribe(email);
      toast.success('Thanks for subscribing!');
      setEmail('');
    } catch (err) {
      toast.error(err.errors?.email?.[0] || err.message);
    }
  };

  const stats = settings.data
    ? [['experience', 'Years of experience'], ['project', 'Properties listed'], ['clients', 'Happy clients'], ['award', 'Awards']].filter(([k]) => settings.data[k])
    : [];

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <HeroArt />
          <div className="hero-shade" />
        </div>
        <div className="container hero-grid">
          <div className="hero-inner">
            <span className="hero-pill">{t('heroKicker')}</span>
            <h1>{t('heroTitle')}<span>{t('heroTitle2')}</span></h1>
            <p>{t('heroSub')}</p>
            <Link to="/properties" className="btn hero-cta">{t('search')} →</Link>
          </div>

          <form className="hero-card" onSubmit={onSearch}>
            <h2><Icon.Search /> {t('heroCardTitle')}</h2>
            <p className="muted">{t('heroCardSub')}</p>
            <div className="hero-card-grid">
              <label>{t('cityLabel')}
                <select value={cityId} onChange={(e) => { setCityId(e.target.value); setSubId(''); }}>
                  <option value="">{t('allCities')}</option>
                  {cities.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>{t('areaLabel')}
                <select value={subId} onChange={(e) => setSubId(e.target.value)} disabled={!cityId}>
                  <option value="">{t('allAreas')}</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
              <label>{t('typeLabel')}
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">{t('allTypes')}</option>
                  {Object.values(CATEGORIES).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </label>
              <label>{t('maxRent')}
                <input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="15000" />
              </label>
            </div>
            <button className="btn btn-primary btn-block" type="submit"><Icon.Search /> {t('search')}</button>
          </form>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((i) => (
            <span key={i}>Verified listings ✦ Zero brokerage worries ✦ Book a visit online ✦ Flats · Offices · Shops · Bachelor seats ✦ Smart Tolet — your next home, sorted ✦&nbsp;</span>
          ))}
        </div>
      </div>

      {stats.length > 0 && (
        <div className="container">
          <div className="stats">
            {stats.map(([k, label]) => (
              <div key={k}><strong>{settings.data[k]}</strong><span>{label}</span></div>
            ))}
          </div>
        </div>
      )}

      <section className="section tight">
        <div className="container">
          <div className="cat-tiles">
            {Object.entries(CATEGORIES).map(([slug, c]) => (
              <Link key={slug} to={`/rent/${slug}`} className="cat-tile">
                <strong>{c.name}</strong>
                <span>{c.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PropertyRow title={t('hotNew')} query={{ badge: 'hot_new' }} />
      <PropertyRow title={t('trending')} query={{ badge: 'trend' }} />
      <PropertyRow title={t('bestRated')} query={{ badge: 'best_rated' }} />
      <PropertyRow title={t('latest')} query={{ sort: 'latest' }} />

      {cities.data?.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <SectionHead title={t('browseByCity')} />
            <div className="city-chips">
              {cities.data.map((c) => (
                <Link key={c.id} to={`/city/${c.id}`} className="city-chip"><Icon.Pin /> {c.name}</Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews.data?.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title={t('reviews')} />
            <div className="grid grid-3">
              {reviews.data.map((r) => (
                <blockquote key={r.id} className="review">
                  <p>“{r.message}”</p>
                  <footer>— {r.name}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewed />

      <section className="cta">
        <div className="container cta-inner">
          <div>
            <h2>{t('subscribeTitle')}</h2>
            <p>Be the first to know when new homes are listed.</p>
          </div>
          <form onSubmit={onSubscribe} className="cta-form">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailAddress')} />
            <button className="btn btn-light">{t('subscribe')}</button>
          </form>
        </div>
      </section>
    </>
  );
}
