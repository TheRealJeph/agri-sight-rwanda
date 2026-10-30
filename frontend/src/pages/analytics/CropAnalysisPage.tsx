
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Database,
  Home,
  MapPinned,
  Menu,
  RefreshCw,
  Sprout,
  Wheat,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type CropRecord = {
  crop: string;
  yield: number;
  records: number;
};

type DashboardData = {
  source: string;
  period: string;
  filters: {
    years: number[];
    seasons: string[];
    crops: string[];
    districts: string[];
  };
  summary: {
    average_yield_kg_ha: number;
    reliable_rows: number;
    crops_covered: number;
  };
  by_crop: CropRecord[];
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(value);

export default function CropAnalysisPage() {
  const [mobileNav, setMobileNav] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [year, setYear] = useState('all');
  const [season, setSeason] = useState('all');
  const [district, setDistrict] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ year, season, district });
      const response = await fetch(
        `/api/v1/analytics/dashboard/?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          `Analytics API returned ${response.status}. Check that Django is running.`
        );
      }

      const result: DashboardData = await response.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load crop analysis.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [year, season, district]);

  const crops = data?.by_crop ?? [];

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${mobileNav ? 'open' : ''}`}>
        <Link to="/" className="sidebar-brand">
          <img
            src="/logo/agri-sight-mark-transparent.png"
            alt="Agri-Sight"
          />
          <span>
            <b>Agri-Sight Rwanda</b>
            <small>Agricultural Intelligence</small>
          </span>
          <button
  type="button"
  className="mobile-close"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileNav(false);
  }}
  aria-label="Close navigation"
>
  <X size={20} />
</button>
        </Link>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <Link to="/dashboard">
            <Home size={18} /> Overview
          </Link>
          <Link to="/crop-analysis" className="active">
            <Wheat size={18} /> Crop Analysis
          </Link>
          <Link to="/district-explorer">
            <MapPinned size={18} /> District Explorer
          </Link>
          <Link to="/data-quality">
            <Database size={18} /> Data Quality
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-leaf">
            <Sprout size={38} />
            <b>Better data.<br />Stronger agriculture.</b>
            <small>Insights for a prosperous Rwanda</small>
          </div>
          <div className="sidebar-foot">
            NISR DATA · {data?.period ?? '2023–2025'}
          </div>
        </div>
      </aside>

      {mobileNav && (
  <button
    type="button"
    className="nav-scrim"
    onClick={() => setMobileNav(false)}
    aria-label="Close menu"
  />
)}

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="page-title-row">
  <div>
    <button
      type="button"
      className="mobile-menu"
      onClick={() => setMobileNav(true)}
      aria-label="Open navigation"
    >
      <Menu size={22} />
    </button>
              <div className="breadcrumbs">
                Workspace <span>/</span> Crop Analysis
              </div>
              <h1>Crop Analysis</h1>
              <p>
                Compare recorded crop yields and identify areas that
                may need further agricultural investigation.
              </p>
            </div>
          </div>

          <section className="filter-panel">
            <div className="filter-heading">
              <span>
                <BarChart3 size={17} /> Analysis filters
              </span>
              <button
                type="button"
                onClick={() => {
                  setYear('all');
                  setSeason('all');
                  setDistrict('all');
                }}
              >
                Reset filters
              </button>
            </div>

            <div className="filter-controls">
              <label>
                Survey year
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                >
                  <option value="all">All years</option>
                  {data?.filters.years.map((item) => (
                    <option key={item} value={String(item)}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Season
                <select
                  value={season}
                  onChange={(event) => setSeason(event.target.value)}
                >
                  <option value="all">All seasons</option>
                  {data?.filters.seasons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                District
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                >
                  <option value="all">All districts</option>
                  {data?.filters.districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {error && (
            <div className="inline-error">
              <b>Unable to load crop data</b>
              <span>{error}</span>
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => void load()}
              >
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          )}

          {loading && !data ? (
            <div className="loading-card">
              <span className="spinner" />
              <b>Loading crop analysis…</b>
              <small>Reading the cleaned NISR summary.</small>
            </div>
          ) : data ? (
            <>
              <section className="metric-grid">
                <article className="metric-card">
                  <span className="metric-icon green">
                    <Wheat />
                  </span>
                  <div className="metric-label">Crops represented</div>
                  <div className="metric-value">
                    {formatNumber(data.summary.crops_covered)}
                  </div>
                  <div className="metric-note">
                    In the current filtered dataset
                  </div>
                </article>

                <article className="metric-card">
                  <span className="metric-icon blue">
                    <Sprout />
                  </span>
                  <div className="metric-label">Average recorded yield</div>
                  <div className="metric-value">
                    {formatNumber(data.summary.average_yield_kg_ha)} kg/ha
                  </div>
                  <div className="metric-note">
                    Based on reliable rows returned by the API
                  </div>
                </article>

                <article className="metric-card">
                  <span className="metric-icon purple">
                    <Database />
                  </span>
                  <div className="metric-label">Reliable rows</div>
                  <div className="metric-value">
                    {formatNumber(data.summary.reliable_rows)}
                  </div>
                  <div className="metric-note">
                    Summary rows, not unique farmers
                  </div>
                </article>
              </section>

              <section className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Crop yield comparison</h2>
                    <p>
                      Mean weighted yield across reliable district-crop
                      records · kg/ha
                    </p>
                  </div>
                  <span className="chart-icon">
                    <BarChart3 size={17} />
                  </span>
                </div>

                <div className="chart-area">
                  {crops.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={crops}
                        layout="vertical"
                        margin={{
                          top: 8,
                          right: 24,
                          left: 12,
                          bottom: 8,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="crop"
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${formatNumber(Number(value))} kg/ha`,
                            'Mean yield',
                          ]}
                        />
                        <Bar
                          dataKey="yield"
                          fill="#138a62"
                          radius={[0, 5, 5, 0]}
                          barSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-empty">
                      No reliable crop records match these filters.
                    </div>
                  )}
                </div>

                <p className="chart-footnote">
                  Yield differences alone do not establish why crops
                  perform differently. Consider season, district,
                  sample size, and agronomic context before drawing
                  conclusions.
                </p>
              </section>

              <section className="panel data-table-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Crop summary</h2>
                    <p>
                      {data.source} · {data.period}
                    </p>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Crop</th>
                        <th>Mean yield (kg/ha)</th>
                        <th>Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crops.map((item) => (
                        <tr key={item.crop}>
                          <td><b>{item.crop}</b></td>
                          <td>{formatNumber(item.yield)}</td>
                          <td>{formatNumber(item.records)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!crops.length && (
                    <div className="empty-table">
                      No crop summary is available for this selection.
                    </div>
                  )}
                </div>
              </section>

              <section className="data-note">
                <div className="note-icon">
                  <Database size={20} />
                </div>
                <div>
                  <b>Data interpretation</b>
                  <p>
                    Crop summaries are calculated from reliable
                    district-crop rows in the cleaned NISR dataset.
                    Comparisons are descriptive and do not establish
                    causation.
                  </p>
                  <Link to="/data-quality">
                    Review data quality →
                  </Link>
                </div>
              </section>
            </>
          ) : null}

          <footer className="dashboard-footer">
            <span>© 2026 Agri-Sight Rwanda</span>
            <span>Data: NISR Seasonal Agricultural Survey</span>
            <span>Better data. Stronger agriculture.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
