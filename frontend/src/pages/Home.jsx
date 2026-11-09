import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contentApi, placesApi, propertyApi } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { useLang } from '../context/LangContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { Loader, SectionHead } from '../components/Ui.jsx';
import { Icon } from '../components/Icons.jsx';
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
  usePageMeta('House rental made simple', 'Find verified homes, flats, offices and shops for rent. Search, save, compare and book a visit.');
  const navigate = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [cityId, setCityId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [email, setEmail] = useState('');
  const cities = useFetch(() => placesApi.cities(), []);
  const reviews = useFetch(() => contentApi.reviews(), []);
  const settings = useFetch(() => contentApi.settings(), []);

  const onSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (cityId) p.set('city_id', cityId);
    if (purpose) p.set('purpose', purpose);
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
        <div className="container hero-inner">
          <h1>{t('heroTitle')}</h1>
          <p>{t('heroSub')}</p>
          <form className="hero-search" onSubmit={onSearch}>
            <div className="hero-field grow">
              <Icon.Search />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} aria-label="Search" />
            </div>
            <select value={cityId} onChange={(e) => setCityId(e.target.value)} aria-label="City">
              <option value="">{t('allCities')}</option>
              {cities.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} aria-label="Purpose">
              <option value="">Rent / Sale</option>
              <option value="Rent">Rent</option>
              <option value="Sale">Sale</option>
            </select>
            <button className="btn btn-primary" type="submit">{t('search')}</button>
          </form>
        </div>
      </section>

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
