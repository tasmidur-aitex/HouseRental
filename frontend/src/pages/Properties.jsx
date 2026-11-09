import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { placesApi, propertyApi } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { useLang } from '../context/LangContext.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import Pagination from '../components/Pagination.jsx';
import HeroArt from '../components/HeroArt.jsx';
import { EmptyState, ErrorBox, Loader } from '../components/Ui.jsx';

const FILTER_KEYS = ['q', 'city_id', 'subcity_id', 'purpose', 'category', 'bedroom', 'bathroom', 'min_price', 'max_price', 'badge', 'sort'];

export default function Properties() {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ''])));
  const page = Number(params.get('page') || 1);

  // keep the form in sync when the URL changes (back button, links from the home page)
  useEffect(() => {
    setForm(Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ''])));
  }, [params]);

  const cities = useFetch(() => placesApi.cities({ with_subcities: 1 }), []);
  const subcities = cities.data?.find((c) => String(c.id) === String(form.city_id))?.subcities || [];

  const query = Object.fromEntries([...params.entries()].filter(([k]) => [...FILTER_KEYS, 'page'].includes(k)));
  const { data, meta, loading, error, reload } = useFetch(() => propertyApi.list({ per_page: 12, ...query }), [params.toString()]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value, ...(k === 'city_id' ? { subcity_id: '' } : {}) }));

  const apply = (e) => {
    e?.preventDefault();
    const next = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => v && next.set(k, v));
    setParams(next);
    setShowFilters(false);
  };
  const clear = () => setParams(new URLSearchParams());
  const goPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="hero hero-compact">
        <div className="hero-bg" aria-hidden="true">
          <HeroArt />
          <div className="hero-shade" />
        </div>
        <div className="container hero-inner">
          <span className="hero-pill">{t('heroKicker')}</span>
          <h1>{t('properties')}</h1>
          <p>{meta ? `${meta.total} results` : t('heroSub')}</p>
        </div>
      </section>
      <div className="container listing">
        <button className="btn btn-outline filter-toggle" onClick={() => setShowFilters(!showFilters)}>{t('filters')}</button>

        <aside className={`filters card ${showFilters ? 'open' : ''}`}>
          <form onSubmit={apply}>
            <h3>{t('filters')}</h3>
            <label className="field"><span className="field-label">Keyword</span>
              <input value={form.q} onChange={set('q')} placeholder={t('searchPlaceholder')} /></label>
            <label className="field"><span className="field-label">City</span>
              <select value={form.city_id} onChange={set('city_id')}>
                <option value="">{t('allCities')}</option>
                {cities.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></label>
            {subcities.length > 0 && (
              <label className="field"><span className="field-label">Area</span>
                <select value={form.subcity_id} onChange={set('subcity_id')}>
                  <option value="">All areas</option>
                  {subcities.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select></label>
            )}
            <label className="field"><span className="field-label">Purpose</span>
              <select value={form.purpose} onChange={set('purpose')}>
                <option value="">Any</option><option>Rent</option><option>Sale</option>
              </select></label>
            <div className="row-2">
              <label className="field"><span className="field-label">Min beds</span>
                <select value={form.bedroom} onChange={set('bedroom')}>
                  <option value="">Any</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
                </select></label>
              <label className="field"><span className="field-label">Min baths</span>
                <select value={form.bathroom} onChange={set('bathroom')}>
                  <option value="">Any</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
                </select></label>
            </div>
            <div className="row-2">
              <label className="field"><span className="field-label">Min price</span>
                <input type="number" min="0" value={form.min_price} onChange={set('min_price')} placeholder="0" /></label>
              <label className="field"><span className="field-label">Max price</span>
                <input type="number" min="0" value={form.max_price} onChange={set('max_price')} placeholder="Any" /></label>
            </div>
            <label className="field"><span className="field-label">{t('sort')}</span>
              <select value={form.sort} onChange={set('sort')}>
                <option value="">{t('newest')}</option>
                <option value="price_asc">{t('priceLow')}</option>
                <option value="price_desc">{t('priceHigh')}</option>
              </select></label>
            <div className="filter-actions">
              <button className="btn btn-primary" type="submit">{t('search')}</button>
              <button className="btn btn-ghost" type="button" onClick={clear}>{t('clear')}</button>
            </div>
          </form>
        </aside>

        <section className="results">
          <ErrorBox error={error} onRetry={reload} />
          {loading && !data ? <Loader /> : data && data.length === 0 ? (
            <EmptyState title={t('noResults')} hint={t('noResultsHint')} action={<button className="btn btn-outline" onClick={clear}>{t('clear')}</button>} />
          ) : (
            <>
              <div className={`grid grid-3 ${loading ? 'dim' : ''}`}>{data?.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
              <Pagination meta={meta} onPage={goPage} />
            </>
          )}
        </section>
      </div>
    </>
  );
}
